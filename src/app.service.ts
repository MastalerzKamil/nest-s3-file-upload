import { Injectable } from '@nestjs/common';
import { ReadStream } from 'fs';
import * as stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as sharp from 'sharp';
import { getMimeType } from 'stream-mime-type';
import { UploadSuccessDto } from './dto/upload-success.dto';
import * as fs from 'fs';
import { ImageSizes } from './enums/image-sizes.enum';

@Injectable()
export class AppService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly url: string;
  constructor() {
    this.bucket = process.env.S3_BUCKET;
    this.url = `https://${process.env.REGION}.s3.amazonaws.com/${process.env.S3_BUCKET}`;
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.REGION,
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  async uploadContent(fileName: string): Promise<UploadSuccessDto[]> {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const readStream = fs.createReadStream(filePath);
    const { mime } = await getMimeType(readStream);
    const match = mime.split('/');

    if (match[0] === 'image') {
      return await this.resizeAndUploadImage(fileName, readStream, mime);
    }

    return await this.uploadFile(fileName, readStream, mime);
  }

  async resizeAndUploadImage(
    fileName: string,
    readStream: ReadStream,
    mime: string,
  ): Promise<UploadSuccessDto[]> {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const sharpInstance = await sharp(filePath);
    const imageMetadata = await sharpInstance.metadata();

    const result: UploadSuccessDto[] = [];

    const sizes = Object.keys(ImageSizes).map((key) => ImageSizes[key]);

    for (let index = 0; index < sizes.length; index++) {
      const [width, height] = sizes[index].split('x');
      const fileNameWithoutExtension = fileName.split('.');
      const fileKey = `images/${width}x${height}/${fileNameWithoutExtension[2]}.${imageMetadata.format}`;
      const parsedWidth = parseInt(width, 10);
      const parsedHeight = parseInt(height, 10);
      const sharpStream = this.createStreamToSharp({
        width: parsedWidth,
        height: parsedHeight,
        format: imageMetadata.format,
      });

      const { writeStream, uploadFinished } = await this.createWriteStreamToS3({
        Key: fileKey,
        mime: mime,
        filePath,
      });
      readStream.pipe(sharpStream).pipe(writeStream);
      await uploadFinished;

      result.push({
        bucketEndpoint: this.url,
        imageUrl: `${this.url}/${fileKey}`,
      });
    }

    return result;
  }

  async uploadFile(
    fileName: string,
    readStream: ReadStream,
    mime: string,
  ): Promise<UploadSuccessDto[]> {
    const fileKey = `files/${fileName}`;
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;

    const { uploadFinished } = await this.createWriteStreamToS3({
      Key: fileKey,
      mime: mime,
      filePath,
    });

    await uploadFinished.done();
    return [
      {
        bucketEndpoint: this.url,
        imageUrl: `${this.url}/${fileKey}`,
      },
    ];
  }

  createWriteStreamToS3 = async ({ Key, mime, filePath }) => {
    const pass = new stream.PassThrough();
    return {
      writeStream: pass,
      uploadFinished: new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: Key,
          Body: pass,
          ContentType: mime,
        },
      }),
    };
  };

  createStreamToSharp = ({ width, height, format }) => {
    return sharp().resize(width, height).toFormat(format);
  };
}
