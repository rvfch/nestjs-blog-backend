import { Controller, Get } from '@nestjs/common';
import { ImageManagerService } from './image-manager.service';

@Controller()
export class ImageManagerController {
  constructor(private readonly imageManagerService: ImageManagerService) {}

  @Get()
  getHello(): string {
    return this.imageManagerService.getHello();
  }
}
