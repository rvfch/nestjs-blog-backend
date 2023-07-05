import { Test, TestingModule } from '@nestjs/testing';
import { ImageManagerController } from './image-manager.controller';
import { ImageManagerService } from './image-manager.service';

describe('ImageManagerController', () => {
  let imageManagerController: ImageManagerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ImageManagerController],
      providers: [ImageManagerService],
    }).compile();

    imageManagerController = app.get<ImageManagerController>(ImageManagerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(imageManagerController.getHello()).toBe('Hello World!');
    });
  });
});
