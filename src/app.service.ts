import { Injectable } from '@nestjs/common';
import { createReadStream, ReadStream } from 'fs';
import * as stream from 'stream';
import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';
import { getMimeType } from 'stream-mime-type';
import { UploadSuccessDto } from './dto/upload-success.dto';

@Injectable()
export class AppService {
  private s3Client: AWS.S3;
  private readonly bucket: string;
  private readonly url: string;
  constructor() {
    this.s3Client = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.bucket = process.env.S3_BUCKET;
    this.url = `https://${process.env.S3_BUCKET}.s3-website.${process.env.REGION}.amazonaws.com`;
  }

  getHello(): string {
    return 'Hello World!';
  }

  async uploadContent(fileName: string): Promise<UploadSuccessDto> {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const readStream = createReadStream(filePath);
    const { mime } = await getMimeType(readStream);
    const match = mime.split('/');

    if (match[0] === 'image') {
      return await this.resizeAndUploadImage(fileName, readStream);
    }

    return await this.uploadFile(fileName, readStream);
  }

  async uploadFile(
    fileName: string,
    readStream: ReadStream,
  ): Promise<UploadSuccessDto> {
    const fileKey = `files/${fileName}`;

    return await this.sendToS3(fileKey, readStream);
  }

  async resizeAndUploadImage(
    fileName: string,
    readStream: ReadStream,
  ): Promise<UploadSuccessDto> {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const sharpInstance = await sharp(filePath);
    const imageMetadata = await sharpInstance.metadata();
    const { width, height } = imageMetadata;

    return {
      bucketEndpoint: this.url,
      imageUrl: `${this.url}/fileKey`,
    };
  }

  async sendToS3(
    fileKey: string,
    readStream: ReadStream,
  ): Promise<UploadSuccessDto> {
    const { mime } = await getMimeType(readStream);

    const writeStreamToS3 = ({ Bucket, Key }) => {
      const pass = new stream.PassThrough();
      return {
        writeStream: pass,
        uploadFinished: this.s3Client
          .upload({
            Body: pass,
            Bucket,
            ContentType: mime,
            Key,
          })
          .promise(),
      };
    };
    const { writeStream, uploadFinished } = writeStreamToS3({
      Bucket: this.bucket,
      Key: fileKey,
    });

    readStream.pipe(writeStream);
    await uploadFinished;
    return {
      bucketEndpoint: this.url,
      imageUrl: `${this.url}/${fileKey}`,
    };
  }
}
