import { HttpService } from '@nestjs/axios';
import { BadRequestException, ConsoleLogger, Injectable, InternalServerErrorException, PreconditionFailedException } from '@nestjs/common';
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
  log: string;
}

@Injectable()
export class ShortcutService {

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly logger: ConsoleLogger) { }

  async startAssist(user: User, query: any): Promise<ShortcutResponseDto> {
    if (!query || query.length < 1) throw new BadRequestException('Query missing or empty.');
    const token: string | undefined = user.metadata.openai?.token;
    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');
    const assistant: Assistant = user.metadata.openai.shortcut?.assistant ?? await this.createAssistant(token);
    const currentThread: string = user.metadata.openai.shortcut?.currentRun?.thread_id;
    const currentRun: string = user.metadata.openai.shortcut?.currentRun?.id;
    if (currentThread && currentRun) {
      const run = await this.getCurrentRun(token, user.metadata.openai.shortcut);
      if (['queued', 'in_progress', 'requires_action'].includes(run.status)) {
        await this.cancelRun(token, run.thread_id, run.id);
      }
    }

    const shortcut: Shortcut = {
      assistant,
      currentRun: await (currentThread ? this.runThread(token, assistant.id, currentThread, query) : this.createThreadAndRun(token, assistant.id, query)),
      log: ''
    };
    this.writeLog(shortcut, 'User', query)
    user.metadata.openai.shortcut = shortcut;
    this.userService.save(user);
    const result = await this.waitForOpenAI(token, shortcut);
    this.writeLog(shortcut, 'Assistant', result.response);
    this.userService.save(user);
    return result;
  }

  async continue(user: User, query: any): Promise<ShortcutResponseDto> {
    if (!query || query.length < 1) throw new BadRequestException('Query missing or empty.');
    const token: string | undefined = user.metadata.openai?.token;
    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');

    const shortcut: Shortcut = user.metadata.openai.shortcut;
    if (!shortcut) throw new PreconditionFailedException('No shortcut run started.');

    if (shortcut.currentRun.status === 'requires_action') {
      this.writeLog(shortcut, 'User', query)
      shortcut.currentRun = await this.sendInstruction(token, shortcut.currentRun, query);
    } else if (shortcut.currentRun.status === 'in_progress') {
      this.writeLog(shortcut, 'User', query)
      await this.sendMessage(token, shortcut.currentRun.thread_id, query);
    } else if (shortcut.currentRun.status === 'queued') {
      // do nothing
    } else {
      throw new PreconditionFailedException(`Run not in a state where it can take messages: ${shortcut.currentRun.status}`);
    }
    this.userService.save(user);
    const result = await this.waitForOpenAI(token, shortcut);
    this.writeLog(shortcut, 'Assistant', result.response);
    this.userService.save(user);
    return result;
  }

  async cancel(user: User): Promise<void> {
    const token: string | undefined = user.metadata.openai?.token;
    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');

    const shortcut: Shortcut = user.metadata.openai.shortcut;
    if (shortcut) {
      const run = await this.getCurrentRun(token, shortcut);
      if (['queued', 'in_progress', 'requires_action'].includes(run.status)) {
        this.writeLog(shortcut, 'User', 'Cancel');
        this.userService.save(user);
        await this.cancelRun(token, run.thread_id, run.id);
      }
    }
  }

  private async cancelRun(token: string, thread: string, run: string): Promise<void> {
    await this.post(`/threads/${thread}/runs/${run}/cancel`, token, {});
  }

  private async waitForOpenAI(token: string, shortcut: Shortcut, i = 0): Promise<ShortcutResponseDto> {
    if (['cancelling', 'cancelled', 'failed', 'completed', 'expired'].includes(shortcut.currentRun.status)) {
      throw new PreconditionFailedException(`Run has already ended with status ${shortcut.currentRun.status}`);
    }
    if (i > ShortcutConstants.MAX_POLL_COUNT) {
      throw new PreconditionFailedException(`Run step has not ended after ${ShortcutConstants.MAX_POLL_COUNT} polls.`);
    }
    const run = await this.getCurrentRun(token, shortcut);
    shortcut.currentRun = run;
    switch (run.status) {
      case 'requires_action':
        const instruction = this.getToolCallInstruction(run);
        if (!instruction) {
          throw new InternalServerErrorException(`Failed to retrieve tool call instruction from run ${run.required_action}`);
        }
        return { ended: false, response: instruction };
      case 'queued':
      case 'in_progress':
        return await this.delayWait(token, shortcut, i);
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
  private async delayWait(token: string, shortcut: Shortcut, i: number): Promise<ShortcutResponseDto> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          resolve(await this.waitForOpenAI(token, shortcut, ++i));
        } catch (e) {
          reject(e);
        }
      }, ShortcutConstants.POLL_INTERVAL);
    });
  }

  private writeLog(shortcut: Shortcut, by: string, message: any): void {
    if (typeof message === 'string' || typeof message === 'number') {
      shortcut.log += `${by}: ${message}\n\n`;
    } else {
      shortcut.log += `${by}: ${JSON.stringify(message, null, 2)}\n\n`;
    }
  }



  private getToolCallInstruction(run: Run): ShortcutInstructionDto | undefined {
    const result = run.required_action?.submit_tool_outputs?.tool_calls
      ?.filter(call => call.function.name === ShortcutConstants.FUNCTION_NAME)
      .map(call => JSON.parse(call.function.arguments))?.[0];
    if (result && !result.params) {
      result.params = {};
    }
    return result;
  }

  private getToolCallInstructionId(run: Run): string | undefined {
    return run.required_action?.submit_tool_outputs?.tool_calls
      ?.filter(call => call.function.name === ShortcutConstants.FUNCTION_NAME)
      .map(call => call.id)?.[0];
  }

  private async getCurrentRun(token: string, shortcut: Shortcut): Promise<Run> {
    return await this.get<Run>(`/threads/${shortcut.currentRun.thread_id}/runs/${shortcut.currentRun.id}`, token);
  }

  private async createAssistant(token: string): Promise<Assistant> {
    return (await this.post<Assistant>('/assistants', token,
      {
        name: ShortcutConstants.NAME,
        instructions: ShortcutConstants.INSTRUCTIONS,
        model: ShortcutConstants.MODEL,
        tools: [{ type: 'function', function: ShortcutConstants.FUNCTION }]
      } as Assistant));
  }

  private async getLastMessageContent(token: string, run: Run): Promise<string> {
    const msgs = (await this.get<{ data: Message[] }>(`/threads/${run.thread_id}/messages?limit=1`, token)).data;
    if (msgs.length < 1)
      return '';
    return msgs[0].content[0].type === 'text' ? msgs[0].content[0].text.value : '';
  }

  private async sendMessage(token: string, thread: string, message: any): Promise<void> {
    await this.post<Message>(`/threads/${thread}/messages`, token,
      {
        'role': 'user',
        'content': message instanceof String ? message : JSON.stringify(message)
      });
  }

  private async sendInstruction(token: string, run: Run, output: any): Promise<Run> {
    return await this.post<Run>(`/threads/${run.thread_id}/runs/${run.id}/submit_tool_outputs`, token,
      {
        tool_outputs: [
          {
            tool_call_id: this.getToolCallInstructionId(run),
            output: output instanceof String ? output : JSON.stringify(output)
          }
        ]
      });
  }

  private async runThread(token: string, assistant: string, thread: string, query: any): Promise<Run> {
    await this.sendMessage(token, thread, query);
    return (await this.post<Run>(`/threads/${thread}/runs`, token, { assistant_id: assistant }));
  }

  private async createThreadAndRun(token: string, assistant: string, query: any): Promise<Run> {
    return (await this.post<Run>('/threads/runs', token, {
      assistant_id: assistant,
      thread: {
        messages: [
          {
            role: 'user', content: query instanceof String ? query : JSON.stringify(query)
          }
        ]
      }
    }));
  }

  private async post<T>(path: string, token: string, payload: any): Promise<T> {
    try {
      return await firstValueFrom(

        this.httpService.post(
          `https://api.openai.com/v1${path}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v1'
            }
          }
        ).pipe(map((response: AxiosResponse<any, any>) => response.data)));
    } catch (e) {
      this.logger.error(`Failed to post to ${path} with payload ${JSON.stringify(payload, null, 2)}, response: ${JSON.stringify(e.response.data, null, 2)}, error: ${JSON.stringify(e, null, 2)}`);
      throw e;
    }
  }

  private async get<T>(path: string, token: string): Promise<T> {
    try {
      return await firstValueFrom(this.httpService.get(
        `https://api.openai.com/v1${path}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1'
          }
        }
      ).pipe(map((response: AxiosResponse<any, any>) => response.data)));
    } catch (e) {
      this.logger.error(`Failed to post to ${path}, response: ${JSON.stringify(e.response.data, null, 2)}, error: ${JSON.stringify(e, null, 2)}`);
      throw e;
    }
  }
}
