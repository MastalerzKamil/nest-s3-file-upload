import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    it('should return "File uploaded."', async () => {
      jest.spyOn(appService, 'uploadContent').mockResolvedValue([
        {
          bucketEndpoint: 'https://bucket.s3-website.eu-west-1.amazonaws.com',
          imageUrl:
            'https://bucket.s3-website.eu-west-1.amazonaws.com/files/file.png',
        },
      ]);

      expect(await appController.upload('test.jpg')).toEqual([
        {
          bucketEndpoint: 'https://bucket.s3-website.eu-west-1.amazonaws.com',
          imageUrl:
            'https://bucket.s3-website.eu-west-1.amazonaws.com/files/file.png',
        },
      ]);
    });
  });
});
