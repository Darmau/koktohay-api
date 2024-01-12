import {Module} from '@nestjs/common';
import {LanguageController} from './language.controller';
import {LanguageService} from './language.service';
import {MongooseModule} from '@nestjs/mongoose';
import {LanguageSchema} from '@/schemas/language.schema';
import {PrismaModule} from "@/prisma/prisma.module";

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Language', schema: LanguageSchema}]),
    PrismaModule
  ],
  controllers: [LanguageController],
  providers: [LanguageService],
  exports: [LanguageService],
})
export class LanguageModule {
}
