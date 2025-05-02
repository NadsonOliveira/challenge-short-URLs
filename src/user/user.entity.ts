import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: 'Unique user identifier',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: 'hashedpassword123',
    description: 'User password (hash)',
  })
  @Column()
  password: string;
}
