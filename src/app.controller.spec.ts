import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('upload', () => {
    it('should return "File uploaded."', () => {
      const mockedResponse: Response = {
        status: jest.fn().mockReturnValue({
          send: jest.fn().mockReturnValue({
            HttpCode: HttpStatus.CREATED,
            Message: 'File uploaded.',
          }),
        }),
      } as unknown as Response;

      jest.spyOn(appService, 'uploadFile').mockImplementation(() => jest.fn());

      expect(appController.upload('test.jpg', mockedResponse)).toEqual({
        HttpCode: HttpStatus.CREATED,
        Message: 'File uploaded.',
      });
    });
  });
});
