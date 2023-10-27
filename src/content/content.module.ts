import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';
import { PhotoModule } from './photo/photo.module';
import { VideoModule } from './video/video.module';
import { MemoModule } from './memo/memo.module';
import { EntryModule } from './entry/entry.module';
import { LanguageModule } from '@/settings/language/language.module';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [
    ArticleModule,
    PhotoModule,
    VideoModule,
    MemoModule,
    EntryModule,
    EntryModule,
    LanguageModule,
    MediaModule,
  ],
})
export class ContentModule {}
