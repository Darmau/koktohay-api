import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class LanguageService {

  constructor(private prisma: PrismaService) {}

  // 获取所有语言
  async getAllLanguages() {
    const languages = await this.prisma.language.findMany({
      select: {
        lang: true,
        locale: true,
        is_default: true,
      }
    });
    if (!languages) {
      throw new HttpException('No languages found', HttpStatus.NOT_FOUND);
    }
    return languages;
  }

  // 返回默认语言
  async getDefaultLanguage() {
    const language = await this.prisma.language.findFirst({
      where: {
        is_default: true
      },
      select: {
        lang: true,
        locale: true,
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
    const languages = await this.prisma.language.findFirst({
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
      status: 'Success',
      ...newLanguage
    };
  }

  // 修改默认语言
  async updateDefaultLanguage(lang: string) {
    const existLanguage = await this.prisma.language.findUnique({
      where: {
        lang: lang
      }
    });
    if (!existLanguage) {
      throw new HttpException('Language not found', HttpStatus.NOT_FOUND);
    }
    await this.prisma.language.updateMany({
      where: {
        is_default: true
      },
      data: {
        is_default: false
      }
    });
    return this.prisma.language.update({
      where: {
        lang: lang
      },
      data: {
        is_default: true
      }
    });
  }

  // 删除语言
  async deleteLanguage(lang: string) {
    try {
      await this.prisma.language.delete({
        where: {
          lang: lang
        }
      });
    } catch (e) {
      throw new HttpException('Language not found', HttpStatus.NOT_FOUND);
    }

    const defaultLanguage = await this.prisma.language.findFirst({
      where: {
        is_default: true
      }
    });

    if (!defaultLanguage) {
      const remainingLanguages = await this.prisma.language.findMany({
        where: {
          lang: {
            not: lang
          }
        }
      });

      if (remainingLanguages.length > 0) {
        const firstLanguage = remainingLanguages[0];

        await this.prisma.language.update({
          where: {
            id: firstLanguage.id
          },
          data: {
            is_default: true
          }
        });
      }
    }

    return {
      status: 'Success',
      lang: lang,
    }
  }

}
