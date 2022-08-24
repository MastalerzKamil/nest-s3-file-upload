import { FileValidationMiddleware } from './file-validation.middleware';
import { HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as mimeType from 'stream-mime-type';

describe('FileValidationMiddleware', () => {
  beforeAll(() => {
    process.env.SOURCE_DIRECTORY = './src/files';
    process.env.MAX_FILE_SIZE = '100';
  });

  it('should be defined', () => {
    expect(new FileValidationMiddleware()).toBeDefined();
  });

  it('should return BadRequest if file is not provided', async () => {
    const middleware = new FileValidationMiddleware();
    const req = {
      params: {
        fileName: '',
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await middleware.use(req, res, () => jest.fn());

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      HttpCode: HttpStatus.BAD_REQUEST,
      Message: 'File is required',
    });
  });

  it('should return BadRequest if file is too large', async () => {
    jest.spyOn(fs.promises, 'stat').mockResolvedValue({
      size: 101,
    } as unknown as fs.Stats);
    const middleware = new FileValidationMiddleware();
    const req = {
      params: {
        fileName: 'test.jpg',
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await middleware.use(req, res, () => jest.fn());

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      HttpCode: HttpStatus.BAD_REQUEST,
      Message: 'File test.jpg is too large.',
    });
  });

  it('should return BadRequest if file is not an allowed mime type', async () => {
    jest.spyOn(fs.promises, 'stat').mockResolvedValue({
      size: 100,
    } as unknown as fs.Stats);
    jest
      .spyOn(fs, 'createReadStream')
      .mockReturnValue({} as unknown as fs.ReadStream);
    jest.spyOn(mimeType, 'getMimeType').mockResolvedValue({
      mime: 'test',
    } as any);
    const middleware = new FileValidationMiddleware();
    const req = {
      params: {
        fileName: 'test.jpg',
      },
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;

    await middleware.use(req, res, () => jest.fn());

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      HttpCode: HttpStatus.BAD_REQUEST,
      Message: 'File test.jpg is not an allowed mime type.',
    });
  });
});
