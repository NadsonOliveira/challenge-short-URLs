import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'Original URL that will be shortened',
    example: 'https://meusite.com/pagina-importante',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;
}
