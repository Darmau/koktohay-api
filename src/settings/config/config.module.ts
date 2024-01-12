import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from '@/schemas/settings.schema';
import {PrismaModule} from "@/prisma/prisma.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
      PrismaModule
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
