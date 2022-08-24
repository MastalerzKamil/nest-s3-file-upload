import { Injectable } from '@nestjs/common';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  uploadFile(fileName: string): void {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const readStream = createReadStream(filePath);
    const writeStream = createWriteStream(`./data/${fileName}`);

    readStream.pipe(writeStream);
  }
}
