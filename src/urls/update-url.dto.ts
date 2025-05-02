import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateUrlDto {
  @ApiProperty({
      description: 'Original URL that will be shortened',
      example: 'https://meusite.com/pagina-importante',
    })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  newUrl: string;
}
