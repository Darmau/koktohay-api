import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleSchema } from '@/schemas/article.schema';
import { EntrySchema } from '@/schemas/entry.schema';
import { LanguageSchema } from '@/schemas/language.schema';
import { LanguageService } from '@/settings/language/language.service';
import { EntryService } from '@/content/entry/entry.service';
import { PhotoSchema } from '@/schemas/photo.schema';
import { ImageService } from '@/media/image/image.service';
import { ImageSchema } from '@/schemas/image.schema';
import { VideoSchema } from '@/schemas/video.schema';
import { ConfigService } from '@/settings/config/config.service';
import { SettingsSchema } from '@/schemas/settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: 'Language', schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
    MongooseModule.forFeature([{ name: 'Photo', schema: PhotoSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  controllers: [ArticleController],
  providers: [
    ArticleService,
    LanguageService,
    EntryService,
    ImageService,
    ConfigService,
  ],
  exports: [ArticleService],
})
export class ArticleModule {}
