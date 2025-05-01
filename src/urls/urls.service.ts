import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm'; 
import { Url } from './urls.entity';
import { CreateUrlDto } from './create-url.dto';
import { generateShortCode } from 'src/utils/shortCode'

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortUrl(createUrlDto: CreateUrlDto, userId?: string) {
    const shortCode =  generateShortCode();

  
    const newUrl = this.urlRepository.create({
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      userId: userId || undefined, 
      clicks: 0,
      createdAt: new Date(),
    });
  
    await this.urlRepository.save(newUrl);
  
    return {
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    };
  }

  async findAllByUser(userId: string) {
    return this.urlRepository.find({
      where: { userId, deletedAt: IsNull() }, 
      select: ['id', 'userId','originalUrl', 'shortCode', 'clicks', 'createdAt', 'updatedAt'],
    });
  }

  async findByShortCode(shortCode: string, clicks: number) {
    return this.urlRepository.findOne({
      where: { shortCode, clicks, deletedAt: IsNull() }, 
    });
  }

  async registerClick(url: Url): Promise<void> {
    url.clicks += 1; 
    url.updatedAt = new Date(); 

    await this.urlRepository.save(url); 
  }

  async updateUserUrl(id: string, newUrl: string, userId: string) {
    const url = await this.urlRepository.findOne({
      where: { id, userId, deletedAt: IsNull() }, 
    });

    if (!url) {
      throw new NotFoundException('URL não encontrada ou você não tem permissão.');
    }

    url.originalUrl = newUrl;
    url.updatedAt = new Date();
    await this.urlRepository.save(url);

    return { message: 'URL atualizada com sucesso.' };
  }

  async deleteUserUrl(shortCode: string, userId:string) {
    const url = await this.urlRepository.findOne({
      where: { userId, shortCode, deletedAt: IsNull() }, 
    });
  
    if (!url) {
      throw new NotFoundException('URL não encontrada ou você não tem permissão.');
    }
  
    url.deletedAt = new Date(); 
    await this.urlRepository.save(url);
  
    return { message: 'URL deletada com sucesso.' };
  }
}
