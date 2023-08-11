import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import * as fs from 'fs';

export interface IFileResponse {
  url?: string;
}

@Injectable()
export class UploadService {
  public upload: Multer;

  constructor(private readonly configService: ConfigService) {
    if (!fs.existsSync('/public/images')) {
      fs.mkdirSync('/public/images', { recursive: true });
    }
  }

  public async uploadFile(file: Express.Multer.File): Promise<IFileResponse> {
    return { url: `/images/${file.filename}` };
  }
}
