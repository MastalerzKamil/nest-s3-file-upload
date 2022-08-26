import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { AppService } from './app.service';
import { UploadSuccessDto } from './dto/upload-success.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put('/:fileName')
  async upload(
    @Param('fileName') fileName: string,
  ): Promise<UploadSuccessDto[]> {
    if (fileName === undefined) {
      throw new BadRequestException(new Error('File name is required'));
    }

    try {
      return await this.appService.uploadContent(fileName);
    } catch (error) {
      throw new BadRequestException(new Error(error.message));
    }
  }
}
