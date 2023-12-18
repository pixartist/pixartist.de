import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, PreconditionFailedException } from '@nestjs/common';
import { firstValueFrom, map } from 'rxjs';
import { AxiosResponse } from 'axios';

import { UserService } from '../../user/user.service';
import { User } from '../../user/user.schema';
import { ShortcutInstructionDto, ShortcutResponseDto } from './shortcut-response.dto';
import { Assistant, Message, Run } from './openai-data';
import { ShortcutConstants } from './shortcut.constants';

interface Shortcut {
  assistant: Assistant;
  currentRun: Run;
}

@Injectable()
export class ShortcutService {


  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService) { }

  async startAssist(user: User, query: string): Promise<ShortcutResponseDto> {

    const token: string | undefined = user.metadata.openai?.token;
    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');
    const assistant = user.metadata.openai.shortcut?.assistant ?? await this.createAssistant(token);
    const shortcut: Shortcut = {
      assistant,
      currentRun: await this.createThreadAndRun(token, assistant.id, query)
    };
    user.metadata.openai.shortcut = shortcut;
    this.userService.save(user);
    return await this.waitForOpenAI(token, shortcut);
  }

  async continue(user: User, query: string): Promise<ShortcutResponseDto> {
    const token: string | undefined = user.metadata.openai?.token;
    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');

    const shortcut: Shortcut = user.metadata.openai.shortcut;
    if (!shortcut) throw new PreconditionFailedException('No shortcut run started.');

    if (shortcut.currentRun.status === 'requires_action') {
      await this.sendInstruction(token, shortcut.currentRun, query);
    } else if (shortcut.currentRun.status === 'in_progress') {
      await this.sendMessage(token, shortcut.currentRun, query);
    } else {
      throw new PreconditionFailedException(`Run not in a state where it can take messages: ${shortcut.currentRun.status}`);
    }
    return await this.waitForOpenAI(token, shortcut);
  }

  private async waitForOpenAI(token: string, shortcut: Shortcut, i = 0): Promise<ShortcutResponseDto> {
    if (['cancelling', 'cancelled', 'failed', 'completed', 'expired'].includes(shortcut.currentRun.status)) {
      throw new PreconditionFailedException(`Run has already ended with status ${shortcut.currentRun.status}`);
    }
    if (i > ShortcutConstants.MAX_POLL_COUNT) {
      throw new PreconditionFailedException(`Run step has not ended after ${ShortcutConstants.MAX_POLL_COUNT} polls.`);
    }
    const run = await this.get<Run>(`/threads/runs/${shortcut.currentRun.id}`, token);
    shortcut.currentRun = run;
    switch (run.status) {
      case 'requires_action':
        const instruction = this.getToolCallInstruction(run);
        if (!instruction) throw new InternalServerErrorException(`Failed to retrieve tool call instruction from run ${run.required_action}`);
        return { ended: false, response: instruction };
      case 'queued':
      case 'in_progress':
        return await new Promise(
          (resolve =>
            setTimeout(async () =>
              resolve(await this.waitForOpenAI(token, shortcut, ++i)),
              ShortcutConstants.POLL_INTERVAL)
          )
        );
      case 'completed':
      case 'failed':
      case 'cancelling':
      case 'cancelled':
      case 'expired':
        return { ended: true, response: await this.getLastMessageContent(token, run) };
      default:
        throw new InternalServerErrorException(`Unexpected status ${run.status}`);
    }
  }
  private getToolCallInstruction(run: Run): ShortcutInstructionDto | undefined {
    return run.required_action?.submit_tool_outputs?.tool_calls
      ?.filter(call => call.function.name === ShortcutConstants.FUNCTION_NAME)
      .map(call => JSON.parse(call.function.arguments))?.[0];
  }
  private getToolCallInstructionId(run: Run): string | undefined {
    return run.required_action?.submit_tool_outputs?.tool_calls
      ?.filter(call => call.function.name === ShortcutConstants.FUNCTION_NAME)
      .map(call => call.id)?.[0];
  }

  private async createAssistant(token: string): Promise<Assistant> {
    return (await this.post<Assistant>('/assistants', token,
      {
        name: ShortcutConstants.NAME,
        instructions: ShortcutConstants.INSTRUCTIONS,
        model: ShortcutConstants.MODEL,
        tools: { type: 'function', function: ShortcutConstants.FUNCTION }
      }));
  }

  private async getLastMessageContent(token: string, run: Run): Promise<string> {
    const msgs = (await this.get<{ data: Message[] }>(`/threads/${run.thread_id}/messages?limit=1`, token)).data;
    if (msgs.length < 1)
      return '';
    return msgs[0].content[0].type === 'text' ? msgs[0].content[0].text.value : '';
  }

  private async sendMessage(token: string, run: Run, message: string): Promise<void> {
    await this.post<Message>(`/threads/${run.thread_id}/messages`, token,
      {
        'role': 'user',
        'content': message
      });
  }
  private async sendInstruction(token: string, run: Run, output: string): Promise<void> {
    await this.post<Run>(`/threads/${run.thread_id}/runs/${run.id}/submit_tool_outputs`, token,
      {
        threadId: run.thread_id,
        runId: run.id,
        functionResponses: [
          {
            id: this.getToolCallInstructionId(run),
            output
          }
        ]
      });
  }

  private async createThreadAndRun(token: string, assistant: string, query: string): Promise<Run> {
    return (await this.post<Run>('/threads/runs', token, {
      assistant_id: assistant,
      thread: {
        messages: [
          {
            role: 'user', content: query
          }
        ]
      }
    }));
  }

  private async post<T>(path: string, token: string, payload: any): Promise<T> {
    return firstValueFrom(this.httpService.post(`https://api.openai.com/v1${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'true'
        },
        data: payload
      }).pipe(map((response: AxiosResponse<any, any>) => response.data)));
  }

  private async get<T>(path: string, token: string): Promise<T> {
    return firstValueFrom(this.httpService.get(`https://api.openai.com/v1${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'true'
        }
      }).pipe(map((response: AxiosResponse<any, any>) => response.data)));
  }
}
