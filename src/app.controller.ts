import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put('/:fileName')
  upload(
    @Param('fileName') fileName: string,
    @Res() response: Response,
  ): object {
    if (fileName === undefined)
      throw new BadRequestException('File is required');

    this.appService.uploadFile(fileName);

    return response
      .status(HttpStatus.CREATED)
      .send({ HttpCode: HttpStatus.CREATED, Message: 'File uploaded.' });
  }
}
