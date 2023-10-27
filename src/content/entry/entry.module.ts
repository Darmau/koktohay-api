import { EntrySchema } from '@/schemas/entry.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EntryController } from './entry.controller';
import { EntryService } from './entry.service';
import { LanguageService } from '@/settings/language/language.service';
import { PhotoSchema } from '@/schemas/photo.schema';
import { ArticleSchema } from '@/schemas/article.schema';
import { VideoSchema } from '@/schemas/video.schema';
import { LanguageSchema } from '@/schemas/language.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: 'Language', schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: 'Photo', schema: PhotoSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
  ],
  controllers: [EntryController],
  providers: [EntryService, LanguageService],
  exports: [EntryService],
})
export class EntryModule {}
