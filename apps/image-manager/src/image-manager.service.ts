import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageManagerService {
  getHello(): string {
    return 'Hello World!';
  }
}
