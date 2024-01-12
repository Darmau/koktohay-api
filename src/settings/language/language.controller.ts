import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LanguageService } from './language.service';
import { AddLangDto } from '@/dto/addLang.dto';

@Controller('language')
export class LanguageController {
  private readonly logger = new Logger(LanguageController.name);
  constructor(private readonly languageService: LanguageService) {}

  // 获取所有语言 /language/all GET
  @Get('all')
  async getAllLanguages() {
    return await this.languageService.getAllLanguages();
  }

  // 增加语言 /language/add POST
  @Post('add')
  async addLanguage(@Body() addLangDto: AddLangDto) {
    return await this.languageService.addLanguage(
      addLangDto.lang,
      addLangDto.locale,
    );
  }

  // 切换默认语言 /language/default?lang= PATCH
  // @Patch('default')
  // async updateDefaultLanguage(@Query('lang') lang: string) {
  //   return await this.languageService.updateDefaultLanguage(lang);
  // }

  // 删除语言 /language/delete?lang= DELETE
//   @Delete('delete')
//   async deleteLanguage(@Query('lang') lang: string) {
//     return await this.languageService.deleteLanguage(lang);
//   }
}
