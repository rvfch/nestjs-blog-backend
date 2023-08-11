import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { IFileResponse, UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '@app/common/utils/express/request-with-user';
import { diskStorage } from 'multer';

// @UseGuards(ThrottlerGuard)
@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, './public/images');
        },
        filename: function (req, file, cb) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            'image' +
              '-' +
              uniqueSuffix +
              '.' +
              file.originalname.split('.')[1],
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  public async uploadFile(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IFileResponse> {
    if (!file) {
      throw new BadRequestException('No file');
    }
    const protocol = req.protocol;
    const port = req.get('host')?.split(':')[1];
    // FIXME: change to environment value
    const host = 'localhost';
    const { url } = await this.uploadService.uploadFile(file);

    return { url: `${protocol}://${host}:${port}${url}` };
  }
}
