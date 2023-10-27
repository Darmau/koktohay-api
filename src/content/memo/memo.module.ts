import { MediaModule } from '@/media/media.module';
import { MemoSchema } from '@/schemas/memo.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Memo', schema: MemoSchema }]),
    MediaModule,
  ],
  controllers: [MemoController],
  providers: [MemoService],
  exports: [MemoService],
})
export class MemoModule {}
