import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from './urls.entity';
import { Repository } from 'typeorm';
import { CreateUrlDto } from './create-url.dto';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<Url>;

  const mockUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));

    jest.clearAllMocks();
    process.env.BASE_URL = 'http://localhost:3000';
  });

  describe('createShortUrl', () => {
    it('should create and return a shortened URL', async () => {
      const dto: CreateUrlDto = { originalUrl: 'https://example.com' };
      const now = new Date();

      const createdUrl: Partial<Url> = {
        originalUrl: dto.originalUrl,
        shortCode: 'abc123',
        userId: 'user123',
        clicks: 0,
        createdAt: now,
      };

      mockUrlRepository.create.mockReturnValue(createdUrl);
      mockUrlRepository.save.mockResolvedValue(createdUrl);

      const result = await service.createShortUrl(dto, 'user123');

      expect(mockUrlRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        originalUrl: dto.originalUrl,
        userId: 'user123',
        shortCode: 'abc123',
      }));

      expect(mockUrlRepository.save).toHaveBeenCalledWith(createdUrl);
      expect(result).toEqual({
        shortUrl: 'http://localhost:3000/abc123',
      });
    });
  });
});
