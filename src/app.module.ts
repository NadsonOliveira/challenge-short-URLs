import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UrlsModule } from './urls/urls.module';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: ['.env','.env.docker'],
    isGlobal: true,
  }),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'default_secret', 
    signOptions: { expiresIn: '1h' }, 
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.PGHOST || (process.env.NODE_ENV === 'development' ? 'localhost' : 'db'),
    port: parseInt(process.env.PGPORT!, 10) || 5432,
    username: process.env.PGUSER,
    url: process.env.DATABASE_URL,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    synchronize: true,
  }),
  UserModule,
  UrlsModule
],
})
export class AppModule {}
