import { HttpService } from '@nestjs/axios';
import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, map } from 'rxjs';
import { Model } from 'mongoose';

import { UserService } from '../../user/user.service';
import { User } from '../../user/user.schema';
@Injectable()
export class ShortcutService {

  private static INSTRUCTIONS = `You control my shortcuts.
  I will provide you with a list of available shortcuts and a task. You can run any number of shortcuts in series. Each shortcuts output will be provided to you.
  Use the shortcut names exactly as provided. Put the named parameters and their values into the params object.`;
  private static MODEL = 'gpt-4';
  private static NAME = 'Shortcut Assistant';
  private static FUNCTION = {
    'name': 'run_shortcut',
    'description': 'Runs the shortcut with the name given in the run field with the given named parameters',
    'parameters': {
      'type': 'object',
      'properties': {
        'run': {
          'type': 'string'
        },
        'params': {
          'type': 'object',
          'patternProperties': {
            '^.*$': {
              'type': 'string'
            }
          }
        }
      },
      'required': [
        'run',
        'params'
      ]
    }
  };

  constructor(private readonly httpService: HttpService, private readonly userService: UserService) { }

  async startAssist(user: User): Promise<string> {
    const token: string | undefined = user.metadata.openai?.token;
    let assistant: string | undefined = user.metadata.openai?.shortcut?.assistant;

    if (!token) throw new PreconditionFailedException('No OpenAI token found in user metadata.');
    if (!assistant) {
      assistant = await this.createAssistant(token);
      user.metadata.openai.shortcut = { assistant };
      this.userService.save(user);
    }
  }

  private async createAssistant(token: string): Promise<string> {
    return await this.post('/assistants', token,
      {
        name: ShortcutService.NAME,
        instructions: ShortcutService.INSTRUCTIONS,
        model: ShortcutService.MODEL,
        tools: { type: 'function', function: ShortcutService.FUNCTION }
      });
  }

  private async post(path: string, token: string, payload: any): Promise<any> {
    return firstValueFrom(this.httpService.post('https://api.openai.com/v1/engines',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'true'
        },
        data: payload
      }).pipe(map((response: AxiosResponse<any, any>) => response.data)));
  }

  private async get(path: string, token: string): Promise<any> {
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
