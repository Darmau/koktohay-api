import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(private prisma: PrismaService) {}

  // 获取所有语言
  async getAllLanguages() {
    const languages = this.prisma.language.findMany({
      select: {
        lang: true,
        locale: true,
      }
    });
    if (!languages) {
      throw new HttpException('No languages found', HttpStatus.NOT_FOUND);
    }
    return languages;
  }

  // 返回默认语言
  async getDefaultLanguage() {
    const language = this.prisma.language.findFirst({
      where: {
        is_default: true
      }
    })
    if (!language) {
      throw new HttpException(
        'No default language found',
        HttpStatus.NOT_FOUND,
      );
    }
    return language;
  }

  // 增加语言
  async addLanguage(lang: string, locale: string) {
    // 检测是否存在相同语言
    const languageExist = await this.prisma.language.findFirst({
      where: {
        lang: {
          equals: lang
        }
      }
    })
    if (languageExist) {
      throw new HttpException(
        'Language already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    // 检测是否存在其他语言，如果没有，则设为默认语言
    const languages = this.prisma.language.findFirst({
      where: {
        is_default: {
          equals: true
        }
      }
    })
    const isDefault = !languages;
    const newLanguage = await this.prisma.language.create({
      data: {
        lang,
        locale,
        is_default: isDefault
      }
    });
    return {
      status: 'success',
      lang: newLanguage.lang,
      locale: newLanguage.locale,
    };
  }

  // 修改默认语言
  // async updateDefaultLanguage(lang: string): Promise<Language> {
  //   const language = await this.languageModel.findOne({ lang: lang }).exec();
  //   if (!language) {
  //     throw new HttpException('Language not exist', HttpStatus.NOT_FOUND);
  //   }
  //   await this.languageModel
  //     .findOneAndUpdate({ isDefault: true }, { isDefault: false })
  //     .exec();
  //   await this.languageModel
  //     .findOneAndUpdate({ lang: lang }, { isDefault: true })
  //     .exec();
  //   return this.languageModel.findOne({ isDefault: true }).exec();
  // }

  // 删除语言
//   async deleteLanguage(lang: string): Promise<Language[]> {
//     const language = await this.languageModel.findOne({ lang: lang }).exec();
//     if (!language) {
//       throw new HttpException('Language not found', HttpStatus.NOT_FOUND);
//     }
//     await this.languageModel.findOneAndRemove({ lang: lang }).exec();
//     const languageCount = await this.languageModel.countDocuments().exec();
//     // 如果只剩一个语言，找到那个语言，将isDefault设为true
//     if (languageCount === 1) {
//       const lastLanguage = await this.languageModel.findOne().exec();
//       await this.languageModel
//         .findOneAndUpdate({ lang: lastLanguage.lang }, { isDefault: true })
//         .exec();
//     }
//     return this.getAllLanguages();
//   }
}
