import { Controller, Post, Get, Patch, Delete, Param, Body, Req, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUrlDto } from './create-url.dto';
import { UpdateUrlDto } from './update-url.dto';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('URLs')
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) { }

  @Post('shorten')
  @ApiOperation({ summary: 'Encurtar uma nova URL' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({ status: 201, description: 'URL encurtada com sucesso.' })
  async shortenUrl(@Body() createUrlDto: CreateUrlDto, @Req() req: any) {
    return this.urlsService.createShortUrl(createUrlDto, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('shorten/auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encurtar uma nova URL (autenticado)' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({ status: 201, description: 'URL encurtada e associada ao usuário.' })
  async shortenUrlAuthenticated(@Body() createUrlDto: CreateUrlDto, @Req() req: any) {
    return this.urlsService.createShortUrl(createUrlDto, req.user.id);
  }

  @Get('/:shortCode')
  @ApiOperation({ summary: 'Redirecionar para a URL original usando o shortCode' })
  @ApiParam({ name: 'shortCode', type: String, description: 'Código curto da URL' })
  @ApiResponse({ status: 302, description: 'Redirecionamento realizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  async redirect(@Param('shortCode') shortCode: string, clicks: number, @Res() res: any) {
    const url = await this.urlsService.findByShortCode(shortCode,clicks);

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL não encontrada');
    }

    await this.urlsService.registerClick(url);

    return res.redirect(url.originalUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todas as URLs encurtadas do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de URLs retornada com sucesso.' })
  async listUserUrls(@Req() req: any) {
    return this.urlsService.findAllByUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':shortCode')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar uma URL encurtada existente' })
  @ApiParam({ name: 'shortCode', type: String, description: 'ID da URL' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada.' })
  async updateUrl(@Param('shortCode') shortCode: string, @Body() updateUrlDto: UpdateUrlDto, @Req() req: any) {
    return this.urlsService.updateUserUrl(shortCode, updateUrlDto.newUrl, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':shortCode')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar uma URL encurtada' })
  @ApiParam({ name: 'shortCode', type: String, description: 'Código curto da URL' })
  @ApiResponse({ status: 200, description: 'URL deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'URL não encontrada ou você não tem permissão.' })
  async deleteUrl(@Param('shortCode') shortCode: string, @Req() req: any) {
    return this.urlsService.deleteUserUrl(shortCode, req.user.id);
  }
  
  
}
