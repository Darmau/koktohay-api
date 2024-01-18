import {
  Body,
  Controller,
  Delete,
  Get, HttpException, HttpStatus, Inject,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {LanguageService} from './language.service';
import {AddLangDto} from '@/dto/addLang.dto';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";

@Controller('language')
export class LanguageController {
  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly languageService: LanguageService
  ) {
  }

  // 获取所有语言 /language/all GET
  @Get('all')
  async getAllLanguages() {
    const languagesFromCache = await this.cacheManager.get('allLanguages');
    if (languagesFromCache) {
      return languagesFromCache;
    }
    const languages = await this.languageService.getAllLanguages();
    if (languages) {
      await this.cacheManager.set('allLanguages', languages, 0);
    }
    return languages;
  }

  // 增加语言 /language/add POST
  @Post('add')
  async addLanguage(@Body() addLangDto: AddLangDto) {
    const newLanguage = await this.languageService.addLanguage(
        addLangDto.lang,
        addLangDto.locale,
    );
    newLanguage && await this.cacheManager.set(
          addLangDto.lang,
          newLanguage,
          0);
    return newLanguage;
  }

  // 切换默认语言 /language/default?lang= PATCH
  @Patch('default')
  async updateDefaultLanguage(@Query('lang') lang: string) {
    if (!lang) {
      throw new HttpException('No language specified', HttpStatus.BAD_REQUEST)
    }
    // 重置缓存
    await this.cacheManager.reset();
    return await this.languageService.updateDefaultLanguage(lang);
  }

  // 删除语言 /language/delete?lang= DELETE
  @Delete('delete')
  async deleteLanguage(@Query('lang') lang: string) {
    const language = await this.languageService.deleteLanguage(lang);
    await this.cacheManager.reset();
    return language;
  }
}
