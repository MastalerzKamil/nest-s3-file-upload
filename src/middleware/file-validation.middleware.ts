import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { getMimeType } from 'stream-mime-type';
import * as fs from 'fs';
import { AllowedMimeTypes } from '../allowed-mime-types';

@Injectable()
export class FileValidationMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: () => void) {
    const fileName = req.params.fileName;
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10);
    let stats: fs.Stats;

    try {
      stats = await fs.promises.stat(filePath);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        HttpCode: HttpStatus.BAD_REQUEST,
        Message: 'File is required',
      });
    }

    if (stats.size > maxFileSize) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        HttpCode: HttpStatus.BAD_REQUEST,
        Message: `File ${fileName} is too large.`,
      });
    }

    const uploadedFileStream = fs.createReadStream(filePath);
    const { mime } = await getMimeType(uploadedFileStream);

    if (!(mime in AllowedMimeTypes)) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        HttpCode: HttpStatus.BAD_REQUEST,
        Message: `File ${fileName} is not an allowed mime type.`,
      });
    }

    next();
  }
}
