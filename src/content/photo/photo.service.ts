import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Photo } from '@/schemas/photo.schema';
import { LanguageService } from '@/settings/language/language.service';
import { ImageService } from '@/media/image/image.service';

@Injectable()
export class PhotoService {
  constructor(
    @InjectModel('Photo') private photoModel: Model<Photo>,
    private readonly languageService: LanguageService,
    private readonly imageService: ImageService,
  ) {}

  private readonly logger = new Logger(PhotoService.name);

  private async generateImageList(images) {
    return await Promise.all(
      images.map(async (image) => {
        return await this.imageService.getImageUrl(image.toString());
      }),
    );
  }

  // 获取默认语言slug
  private async getDefaultLanguageSlug(): Promise<string> {
    return await this.languageService.getDefaultLanguage().then((language) => {
      return language.lang;
    });
  }

  // 根据拍摄日期，获取摄影作品列表
  async getPhotosByShootingTime(limit: number, page: number, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const photosData = await this.photoModel
      .find({ lang: lang, is_published: true })
      .sort({ publish_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
    return await Promise.all(
      photosData.map(async (photo) => {
        const photoObject = photo.toObject();
        const cover = await this.imageService.getImageUrl(
          photoObject.cover.toString(),
        );
        return {
          ...photoObject,
          cover: cover,
        };
      }),
    );
  }

  // 获取特定分类摄影作品列表
  async getPhotosByCategory(
    category: string,
    limit: number,
    page: number,
    lang?: string,
  ) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const photosData = await this.photoModel
      .find({ category: category, lang: lang, is_published: true })
      .sort({ publish_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
    return await Promise.all(
      photosData.map(async (photo) => {
        const photoObject = photo.toObject();
        const cover = await this.imageService.getImageUrl(
          photoObject.cover.toString(),
        );
        return {
          ...photoObject,
          cover: cover,
        };
      }),
    );
  }

  // 获取根据slug和lang获取摄影详情
  async getPhotoDetailBySlug(slug: string, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const photo = await this.photoModel
      .findOne({ slug: slug, lang: lang })
      .exec();
    if (!photo) {
      throw new HttpException('Photo not found', HttpStatus.NOT_FOUND);
    }
    const photoObject = photo.toObject();
    const galleryImageUrls = await this.generateImageList(photoObject.gallery);
    return {
      ...photoObject,
      gallery: galleryImageUrls,
    };
  }

  // 根据id获取摄影详情
  async getPhotoDetailById(id: string) {
    const photo = await this.photoModel.findById(id).exec();
    if (!photo) {
      throw new HttpException('Photo not found', HttpStatus.NOT_FOUND);
    }
    const photoObject = photo.toObject();
    const galleryImageUrls = await this.generateImageList(photoObject.gallery);
    return {
      ...photoObject,
      gallery: galleryImageUrls,
    };
  }

  // 创建摄影作品
  async createPhoto(entry: string, slug: string, session: any, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const newPhoto = new this.photoModel({
      title: 'Please type your title here',
      entry: entry,
      lang: lang,
      slug: slug,
    });
    await newPhoto.save({ session });
    return newPhoto;
  }

  // 更新摄影作品信息
  async updatePhoto(
    id: mongoose.Types.ObjectId,
    title?: string,
    description?: string,
    abstract?: string,
    is_featured?: boolean,
    is_top?: boolean,
    category?: string,
    cover?: mongoose.Types.ObjectId,
    gallery?: mongoose.Types.ObjectId[],
  ) {
    try {
      await this.photoModel.findByIdAndUpdate(id, {
        title: title,
        description: description,
        abstract: abstract,
        is_featured: is_featured,
        is_top: is_top,
        category: category,
        cover: cover,
        gallery: gallery,
      });
      return await this.photoModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to update photo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 发布摄影作品
  async publishPhoto(id: mongoose.Types.ObjectId) {
    try {
      await this.photoModel.findByIdAndUpdate(id, {
        is_published: true,
        publish_date: Date.now(),
      });
      return await this.photoModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to publish photo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 取消发布摄影作品
  async unpublishPhoto(id: mongoose.Types.ObjectId) {
    try {
      await this.photoModel.findByIdAndUpdate(id, {
        is_published: false,
      });
      return await this.photoModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to unpublish photo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 删除摄影作品
  async deletePhoto(id: string) {
    try {
      return await this.photoModel.findByIdAndDelete(id);
    } catch (error) {
      throw new HttpException(
        'Failed to delete photo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
