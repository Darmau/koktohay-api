import { Module } from '@nestjs/common';
import { ThoughtController } from './thought.controller';
import { ThoughtService } from './thought.service';

@Module({
  controllers: [ThoughtController],
  providers: [ThoughtService]
})
export class ThoughtModule {}
