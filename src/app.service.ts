import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as stream from 'stream';
import * as AWS from 'aws-sdk';
import { getMimeType } from 'stream-mime-type';

@Injectable()
export class AppService {
  private s3Client: AWS.S3;
  private readonly bucket: string;
  private url: string;
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

  async uploadFile(fileName: string): Promise<void> {
    const filePath = `${process.env.SOURCE_DIRECTORY}/${fileName}`;
    const readStream = createReadStream(filePath);
    const { mime } = await getMimeType(readStream);
    const fileKey = `files/${fileName}`;

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
  }
}
