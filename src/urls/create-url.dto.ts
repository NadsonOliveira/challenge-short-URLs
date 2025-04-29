import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'URL original que será encurtada',
    example: 'https://meusite.com/pagina-importante',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;
}
