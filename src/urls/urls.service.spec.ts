import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './urls.entity';
import { IsNull, Repository } from 'typeorm';
import { CreateUrlDto } from './create-url.dto';
import { NotFoundException } from '@nestjs/common';
import * as shortCodeUtils from '../utils//shortCode';

describe('UrlsService', () => {
  let service: UrlsService;
  let urlRepository: jest.Mocked<Repository<Url>>;

  const mockUrl: Url = {
    id: '1',
    originalUrl: 'https://example.com',
    shortCode: 'abc123',
    userId: 'user1',
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    urlRepository = module.get(getRepositoryToken(Url));
  });

  describe('createShortUrl', () => {
    it('should create and return a short URL', async () => {
      const dto: CreateUrlDto = { originalUrl: 'https://example.com' };
      jest.spyOn(shortCodeUtils, 'generateShortCode').mockReturnValue('abc123');
      urlRepository.create.mockReturnValue(mockUrl);
      urlRepository.save.mockResolvedValue(mockUrl);

      const result = await service.createShortUrl(dto, 'user1');

      expect(urlRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        originalUrl: dto.originalUrl,
        shortCode: 'abc123',
        userId: 'user1',
      }));
      expect(result).toEqual({ shortUrl: `${process.env.BASE_URL}/abc123` });
    });
  });

  describe('findAllByUser', () => {
    it('should return urls by userId', async () => {
      urlRepository.find.mockResolvedValue([mockUrl]);
  
      const result = await service.findAllByUser('user1');
      expect(result).toEqual([mockUrl]);
  
      expect(urlRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user1', deletedAt: IsNull() }, 
        select: expect.any(Array),
      });
    });
  });
  
  describe('findByShortCode', () => {
    it('should return a url by shortCode and clicks', async () => {
      urlRepository.findOne.mockResolvedValue(mockUrl);
      const result = await service.findByShortCode('abc123', 0);
      expect(result).toEqual(mockUrl);
    });
  });

  describe('registerClick', () => {
    it('should increment clicks and update url', async () => {
      const updatedUrl = { ...mockUrl, clicks: 1 };
      urlRepository.save.mockResolvedValue(updatedUrl);

      await service.registerClick({ ...mockUrl });

      expect(urlRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        clicks: 1,
      }));
    });
  });

  describe('updateUserUrl', () => {
    it('should update the URL if it exists', async () => {
      urlRepository.findOne.mockResolvedValue(mockUrl);
      urlRepository.save.mockResolvedValue({ ...mockUrl, originalUrl: 'https://updated.com' });

      const result = await service.updateUserUrl('1', 'https://updated.com', 'user1');

      expect(result).toEqual({ message: 'URL updated successfully.' });
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserUrl('1', 'https://fail.com', 'user1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserUrl', () => {
    it('should soft delete the URL', async () => {
      urlRepository.findOne.mockResolvedValue(mockUrl);
      urlRepository.save.mockResolvedValue({ ...mockUrl, deletedAt: new Date() });

      const result = await service.deleteUserUrl('abc123', 'user1');

      expect(result).toEqual({ message: 'URL successfully deleted.' });
      expect(urlRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        deletedAt: expect.any(Date),
      }));
    });

    it('should throw NotFoundException if URL not found', async () => {
      urlRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUserUrl('abc123', 'user1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
