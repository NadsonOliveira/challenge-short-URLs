import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UrlsService } from './urls.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUrlDto } from './create-url.dto';
import { UpdateUrlDto } from './update-url.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post('shorten')
  @ApiOperation({ summary: 'Shorten a new URL' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({ status: 200, description: 'URL successfully shortened.' })
  async shortenUrl(@Body() createUrlDto: CreateUrlDto, @Req() req: any) {
    return this.urlsService.createShortUrl(createUrlDto, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('shorten/auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shorten a new URL (authenticated)' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({ status: 200, description: 'URL shortened and associated with user.' })
  async shortenUrlAuthenticated(@Body() createUrlDto: CreateUrlDto, @Req() req: any) {
    return this.urlsService.createShortUrl(createUrlDto, req.user.id);
  }

  @Get('/:shortCode')
  @ApiOperation({ summary: 'Redirect to the original URL using the shortCode' })
  @ApiParam({ name: 'shortCode', type: String, description: 'Short code of the URL' })
  @ApiResponse({ status: 302, description: 'Redirection successful.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async redirect(@Param('shortCode') shortCode: string, clicks: number, @Res() res: any) {
    const url = await this.urlsService.findByShortCode(shortCode, clicks);

    if (!url || url.deletedAt) {
      throw new NotFoundException('URL not found.');
    }

    await this.urlsService.registerClick(url);
    return res.redirect(url.originalUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all shortened URLs of the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of URLs successfully returned.' })
  async listUserUrls(@Req() req: any) {
    return this.urlsService.findAllByUser(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':shortCode')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing shortened URL' })
  @ApiParam({ name: 'shortCode', type: String, description: 'Short code of the URL' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({ status: 200, description: 'URL successfully updated.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  async updateUrl(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req: any,
  ) {
    return this.urlsService.updateUserUrl(shortCode, updateUrlDto.newUrl, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':shortCode')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a shortened URL' })
  @ApiParam({ name: 'shortCode', type: String, description: 'Short code of the URL' })
  @ApiResponse({ status: 200, description: 'URL successfully deleted.' })
  @ApiResponse({ status: 404, description: 'URL not found or unauthorized.' })
  async deleteUrl(@Param('shortCode') shortCode: string, @Req() req: any) {
    return this.urlsService.deleteUserUrl(shortCode, req.user.id);
  }
}
