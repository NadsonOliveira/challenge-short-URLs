import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: 'Identificador único do usuário',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Endereço de email do usuário',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: 'hashedpassword123',
    description: 'Senha do usuário (hash)',
  })
  @Column()
  password: string;
}
