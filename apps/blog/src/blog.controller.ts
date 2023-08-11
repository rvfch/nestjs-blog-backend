import { Public } from '@app/common/core/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class BlogController {
  @Public()
  @Get('/ping')
  ping() {
    return 'pong';
  }
}
