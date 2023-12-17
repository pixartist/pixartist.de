import { Injectable } from '@nestjs/common';

@Injectable()
export class ShortcutService {

  constructor() { }

  assist(): string {
    return 'Hello World!';
  }
}
