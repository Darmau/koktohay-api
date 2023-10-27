import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntryType } from '@/enum/entry.enum';
import { Entry } from '@/schemas/entry.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LanguageService } from '@/settings/language/language.service';
import { Photo } from '@/schemas/photo.schema';
import { Article } from '@/schemas/article.schema';
import { Video } from '@/schemas/video.schema';
import getCurrentTimeFormatted from '@/utils/generateDateSlug';

@Injectable()
export class EntryService {
  constructor(
    @InjectModel('Entry') private entryModel: Model<Entry>,
    @InjectModel('Photo') private photoModel: Model<Photo>,
    @InjectModel('Article') private articleModel: Model<Article>,
    @InjectModel('Video') private videoModel: Model<Video>,
    private readonly languageService: LanguageService,
  ) {}

  private readonly logger = new Logger(EntryService.name);

  // 获取语言列表
  private async getLanguageList(): Promise<string[]> {
    return await this.languageService.getAllLanguages().then((languages) => {
      return languages.map((language) => language.lang);
    });
  }

  // 根据传入的type，返回不同的model，用于后续的操作
  private getModel(type: string): mongoose.Model<any> {
    switch (type) {
      case EntryType.Photo:
        return this.photoModel;
      case EntryType.Article:
        return this.articleModel;
      case EntryType.Video:
        return this.videoModel;
      default:
        throw new HttpException('Entry type not exist', HttpStatus.NOT_FOUND);
    }
  }

  // 获取entry
  async getEntry(entryId: string) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new HttpException('Entry not exist', HttpStatus.NOT_FOUND);
    }
    return entry;
  }

  // 创建内容
  async createEntry(type: EntryType) {
    try {
      const entryData = new this.entryModel({
        slug: getCurrentTimeFormatted(),
        type: type,
      });
      await entryData.save();
      return entryData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 补充多语言版的内容 将新增内容的id和type传入
  async setEntry(
    entryId: string,
    contentId: string,
    lang: string,
    session: any,
  ) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new HttpException('Entry not exist', HttpStatus.NOT_FOUND);
    }
    try {
      entry.versions = {
        ...entry.versions,
        [lang]: contentId,
      };
      await entry.save({ session });
      return entry;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 删除内容
  async deleteEntry(entryId: string, lang: string) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new HttpException('Content not exist', HttpStatus.NOT_FOUND);
    }
    const updatedEntry = await this.entryModel.findByIdAndUpdate(
      entryId,
      {
        $unset: {
          [`versions.${lang}`]: 1,
        },
      },
      { new: true },
    );
    if (Object.keys(updatedEntry.versions).length === 0) {
      await this.entryModel.findByIdAndDelete(entryId);
      return 'Entry deleted';
    }
    return updatedEntry;
  }

  // 获取指定entry的指定语言版本的id
  async getLangContentId(entryId: string, lang: string) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new HttpException('Content not exist', HttpStatus.NOT_FOUND);
    }
    if (!entry.versions[lang]) {
      throw new HttpException(
        'This language version is not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    return entry.versions[lang];
  }

  // 获取可用语言版本的列表
  async getAvailableLangs(entryId: string) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new HttpException('Content not exist', HttpStatus.NOT_FOUND);
    }
    return entry.versions;
  }

  // 检测type+slug是否是独一无二的
  async checkUnique(type: EntryType, slug: string) {
    try {
      const entry = await this.entryModel.findOne({ type, slug });
      if (entry) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 修改slug
  async updateSlug(entryId: string, slug: string) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      const entry = await this.entryModel.findById(entryId).session(session);
      if (!entry) {
        throw new HttpException('Content not exist', HttpStatus.NOT_FOUND);
      }

      // 更新entry的slug
      entry.slug = slug;
      await entry.save({ session });

      // 更新entry.versions[lang]的slug
      const model = this.getModel(entry.type);
      this.logger.debug(entry.versions);

      // 更新entry[lang]的slug
      for (const lang in entry.versions) {
        await model.findByIdAndUpdate(
          entry.versions[lang],
          { slug },
          { session },
        );
      }

      await session.commitTransaction();
      await session.endSession();

      return {
        status: 'success',
        message: 'Slug updated',
        slug,
      };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      this.logger.error(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
