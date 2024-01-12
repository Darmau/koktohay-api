import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotoSchema } from '@/schemas/photo.schema';
import { LanguageService } from '@/settings/language/language.service';
import { LanguageSchema } from '@/schemas/language.schema';
import { EntryService } from '@/content/entry/entry.service';
import { ArticleSchema } from '@/schemas/article.schema';
import { VideoSchema } from '@/schemas/video.schema';
import { ImageService } from '@/media/image/image.service';
import { EntrySchema } from '@/schemas/entry.schema';
import { ImageSchema } from '@/schemas/image.schema';
import { SettingsSchema } from '@/schemas/settings.schema';
import { ConfigService } from '@/settings/config/config.service';
import {PrismaModule} from "@/prisma/prisma.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Language', schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: 'Photo', schema: PhotoSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
    PrismaModule
  ],
  controllers: [PhotoController],
  providers: [
    PhotoService,
    LanguageService,
    EntryService,
    ImageService,
    ConfigService,
  ],
  exports: [PhotoService],
})
export class PhotoModule {}
