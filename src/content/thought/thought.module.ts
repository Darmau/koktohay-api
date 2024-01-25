import {Module} from '@nestjs/common';
import {ThoughtController} from './thought.controller';
import {ThoughtService} from './thought.service';
import {PrismaModule} from "@/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ThoughtController],
  providers: [ThoughtService],
  exports: [ThoughtService],
})
export class ThoughtModule {
}
