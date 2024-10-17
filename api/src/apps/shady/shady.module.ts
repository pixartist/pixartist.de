import { ConsoleLogger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [],
    providers: [ConsoleLogger],
})
export class ShadyModule { }
