import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EntrySchema } from '@/schemas/entry.schema';
import { LanguageSchema } from '@/schemas/language.schema';
import { ArticleSchema } from '@/schemas/article.schema';
import { PhotoSchema } from '@/schemas/photo.schema';
import { VideoSchema } from '@/schemas/video.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Entry', schema: EntrySchema }]),
    MongooseModule.forFeature([{ name: 'Language', schema: LanguageSchema }]),
    MongooseModule.forFeature([{ name: 'Article', schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: 'Photo', schema: PhotoSchema }]),
    MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
