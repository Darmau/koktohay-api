import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {CommentModule} from './comment/comment.module';
import {ContentModule} from './content/content.module';
import {MediaModule} from './media/media.module';
import {NotificationModule} from './notification/notification.module';
import {UsersModule} from './users/users.module';
import {BullModule} from '@nestjs/bull';
import {MemoModule} from './content/memo/memo.module';
import {LanguageModule} from '@/settings/language/language.module';
import {ThrottlerModule} from '@nestjs/throttler';
import {CategoryModule} from './category/category.module';
import {SettingsModule} from '@/settings/settings.module';
import {PrismaModule} from './prisma/prisma.module';
import * as process from "process";
import '@/extensions/bigint.extension';
import {CacheModule} from "@nestjs/cache-manager";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env.development',
    }),
    PrismaModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    // connect to redis for queue task
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST.toString(),
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USER.toString(),
        password: process.env.REDIS_PASSWORD.toString(),
      },
    }),
    // rate limit
    ThrottlerModule.forRoot([
      {
        ttl: 20000,
        limit: 10,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    MediaModule,
    // MemoModule,
    // CommentModule,
    // NotificationModule,
    // ContentModule,
    LanguageModule,
    CategoryModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
