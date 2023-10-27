import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Language } from '@/schemas/language.schema';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    @InjectModel('Language') private languageModel: Model<Language>,
  ) {}

  // 获取所有语言
  async getAllLanguages(): Promise<Language[]> {
    const languages = await this.languageModel.find().exec();
    if (languages.length === 0) {
      throw new HttpException('No language found', HttpStatus.NOT_FOUND);
    }
    return languages;
  }

  // 返回默认语言
  async getDefaultLanguage(): Promise<Language> {
    const language = await this.languageModel
      .findOne({ isDefault: true })
      .exec();
    if (!language) {
      throw new HttpException(
        'No default language found',
        HttpStatus.NOT_FOUND,
      );
    }
    return language;
  }

  // 增加语言
  async addLanguage(lang: string, locale: string): Promise<Language> {
    // 检测是否存在其他语言，如果没有，则设为默认语言
    const languages = await this.languageModel.find().exec();
    const isDefault = languages.length === 0;
    const language = new this.languageModel({
      lang,
      locale,
      isDefault,
    });
    await language.save();
    return language;
  }

  // 修改默认语言
  async updateDefaultLanguage(lang: string): Promise<Language> {
    const language = await this.languageModel.findOne({ lang: lang }).exec();
    if (!language) {
      throw new HttpException('Language not exist', HttpStatus.NOT_FOUND);
    }
    await this.languageModel
      .findOneAndUpdate({ isDefault: true }, { isDefault: false })
      .exec();
    await this.languageModel
      .findOneAndUpdate({ lang: lang }, { isDefault: true })
      .exec();
    return this.languageModel.findOne({ isDefault: true }).exec();
  }

  // 删除语言
  async deleteLanguage(lang: string): Promise<Language[]> {
    const language = await this.languageModel.findOne({ lang: lang }).exec();
    if (!language) {
      throw new HttpException('Language not found', HttpStatus.NOT_FOUND);
    }
    await this.languageModel.findOneAndRemove({ lang: lang }).exec();
    const languageCount = await this.languageModel.countDocuments().exec();
    // 如果只剩一个语言，找到那个语言，将isDefault设为true
    if (languageCount === 1) {
      const lastLanguage = await this.languageModel.findOne().exec();
      await this.languageModel
        .findOneAndUpdate({ lang: lastLanguage.lang }, { isDefault: true })
        .exec();
    }
    return this.getAllLanguages();
  }
}
