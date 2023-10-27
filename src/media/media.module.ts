import { Module } from '@nestjs/common';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ImageModule],
  exports: [ImageModule],
})
export class MediaModule {}
