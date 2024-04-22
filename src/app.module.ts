import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MediaModule} from './media/media.module';
import {BullModule} from '@nestjs/bull';
import {LanguageModule} from '@/settings/language/language.module';
import {ThrottlerModule} from '@nestjs/throttler';
import {SettingsModule} from '@/settings/settings.module';
import {PrismaModule} from './prisma/prisma.module';
import * as process from "process";
import '@/extensions/bigint.extension';
import {CacheModule} from "@nestjs/cache-manager";
import {ThoughtModule} from './content/thought/thought.module';
import {MessageModule} from './message/message.module';
import {AuthModule} from "@/auth/auth.module";
import {UsersModule} from "@/users/users.module";
import { SupabaseService } from './supabase/supabase.service';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env.development',
    }),
    // connect to redis for queue task
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASSWORD,
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
    PrismaModule,
    AuthModule,
    MediaModule,
    LanguageModule,
    SettingsModule,
    ThoughtModule,
    MessageModule,
    UsersModule,
    SupabaseModule
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {
}
