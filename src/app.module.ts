import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { NestjsKnexModule } from 'nestjs-knexjs';
import { UserService } from './user/user.service';


@Module({
  imports: [NestjsKnexModule.register({
      client: 'mysql',
      connection: {
          host: 'remotemysql.com',
          user: 'PrVenWSklm',
          password: 'H9p5XAvf8U',
          database: 'PrVenWSklm',
          port: 3306,
      },
  })],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
