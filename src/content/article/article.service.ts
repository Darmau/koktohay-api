import { Article } from '@/schemas/article.schema';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { LanguageService } from '@/settings/language/language.service';
import { ImageService } from '@/media/image/image.service';

@Injectable()
export class ArticleService {
  private readonly logger = new Logger(ArticleService.name);
  constructor(
    @InjectModel('Article') private articleModel: Model<Article>,
    private readonly languageService: LanguageService,
    private readonly imageService: ImageService,
  ) {}

  // 获取默认语言slug
  private async getDefaultLanguageSlug(): Promise<string> {
    return await this.languageService.getDefaultLanguage().then((language) => {
      return language.lang;
    });
  }

  // 根据发布时间，获取文章列表
  async getArticlesByPublishDate(limit: number, page: number, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const articlesData = await this.articleModel
      .find({ lang: lang, is_published: true })
      .sort({ publish_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
    return await Promise.all(
      articlesData.map(async (photo) => {
        const articleObject = photo.toObject();
        const cover = await this.imageService.getImageUrl(
          articleObject.cover.toString(),
        );
        return {
          ...articleObject,
          cover: cover,
        };
      }),
    );
  }

  // 获取推荐文章列表
  async getFeaturedArticles(limit: number, page: number, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const articlesData = await this.articleModel
      .find({ lang: lang, is_published: true, is_featured: true })
      .sort({ publish_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
    return await Promise.all(
      articlesData.map(async (photo) => {
        const articleObject = photo.toObject();
        const cover = await this.imageService.getImageUrl(
          articleObject.cover.toString(),
        );
        return {
          ...articleObject,
          cover: cover,
        };
      }),
    );
  }

  // 获取特定分类的文章
  async getArticlesByCategory(
    category: string,
    limit: number,
    page: number,
    lang?: string,
  ) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const articlesData = await this.articleModel
      .find({ lang: lang, category: category, is_published: true })
      .sort({ publish_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .allowDiskUse(true)
      .exec();
    return await Promise.all(
      articlesData.map(async (photo) => {
        const articleObject = photo.toObject();
        const cover = await this.imageService.getImageUrl(
          articleObject.cover.toString(),
        );
        return {
          ...articleObject,
          cover: cover,
        };
      }),
    );
  }

  // 根据slug和lang获取文章详情
  async getArticleDetailBySlug(slug: string, lang?: string) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const article = await this.articleModel
      .findOne({ slug: slug, lang: lang })
      .exec();
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const articleObject = article.toObject();
    const cover = await this.imageService.getImageUrl(
      articleObject.cover.toString(),
    );
    return {
      ...articleObject,
      cover: cover,
    };
  }

  // 根据id获取文章详情
  async getArticleDetailById(id: string) {
    const photo = await this.articleModel.findById(id).exec();
    if (!photo) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const articleObject = photo.toObject();
    const cover = await this.imageService.getImageUrl(
      articleObject.cover.toString(),
    );
    return {
      ...articleObject,
      cover: cover,
    };
  }

  // 创建文章
  async createArticle(
    entry: string,
    slug: string,
    session: any,
    lang?: string,
  ) {
    if (!lang) {
      lang = await this.getDefaultLanguageSlug();
    }
    const newArticle = new this.articleModel({
      title: 'Please type your title here',
      entry: entry,
      lang: lang,
      slug: slug,
    });
    await newArticle.save({ session: session });
    return newArticle;
  }

  // 更新文章信息
  async updateArticle(
    id: mongoose.Types.ObjectId,
    title?: string,
    description?: string,
    abstract?: string,
    is_featured?: boolean,
    is_top?: boolean,
    is_premium?: boolean,
    category?: string,
    cover?: mongoose.Types.ObjectId,
  ) {
    try {
      await this.articleModel.findByIdAndUpdate(id, {
        title: title,
        description: description,
        abstract: abstract,
        is_featured: is_featured,
        is_top: is_top,
        category: category,
        is_premium: is_premium,
        cover: cover,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to update article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 更新文章正文
  async updateArticleContent(id: mongoose.Types.ObjectId, content: string) {
    try {
      await this.articleModel.findByIdAndUpdate(id, {
        content: JSON.parse(content),
      });
    } catch (error) {
      throw new HttpException(
        'Failed to update article content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 发布文章
  async publishArticle(id: mongoose.Types.ObjectId) {
    try {
      await this.articleModel.findByIdAndUpdate(id, {
        is_published: true,
        publish_date: Date.now(),
      });
      return await this.articleModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to publish article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 取消发布文章
  async unpublishArticle(id: mongoose.Types.ObjectId) {
    try {
      await this.articleModel.findByIdAndUpdate(id, {
        is_published: false,
      });
      return await this.articleModel.findById(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to unpublish article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 删除文章
  async deleteArticle(id: string) {
    try {
      return await this.articleModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to delete article',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
