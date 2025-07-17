/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute
      },
    ]),
    AuthModule,
    UsersModule,
    DatabaseModule,
    EmailModule,
  ],
  // controllers: [AppController, DatabaseController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    DatabaseService,
  ],
  //controllers: [TransactionController, WebhooksController, PaymentsController],
})
export class AppModule {}
