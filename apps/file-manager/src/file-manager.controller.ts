import { Controller, Get } from '@nestjs/common';

@Controller()
export class FileManagerController {
  @Get('/ping')
  ping() {
    return 'pong';
  }
}
