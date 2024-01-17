import {Module} from '@nestjs/common';
import {ImageController} from './image.controller';
import {ImageService} from './image.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageSchema} from '@/schemas/image.schema';
import {BullModule} from '@nestjs/bull';
import {ImageProcessor} from './image.processor';
import {ConfigService} from '@/settings/config/config.service';
import {PrismaModule} from "@/prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'image',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageProcessor, ImageService, ConfigService],
  exports: [ImageService],
})
export class ImageModule {
}
