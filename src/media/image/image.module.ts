import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageSchema } from '@/schemas/image.schema';
import { BullModule } from '@nestjs/bull';
import { ImageProcessor } from './image.processor';
import { ConfigService } from '@/settings/config/config.service';
import { SettingsSchema } from '@/schemas/settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Image', schema: ImageSchema },
      { name: 'Settings', schema: SettingsSchema },
    ]),
    BullModule.registerQueue({
      name: 'image',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageProcessor, ImageService, ConfigService],
  exports: [ImageService],
})
export class ImageModule {}
