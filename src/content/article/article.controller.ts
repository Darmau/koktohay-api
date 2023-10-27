import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { EntryService } from '../entry/entry.service';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Entry } from '@/schemas/entry.schema';
import { PositiveIntPipe } from '@/pipe/positiveInt.pipe';
import { EntryType } from '@/enum/entry.enum';
import { UpdateArticleDto } from '@/dto/updateArticle.dto';

@Controller('article')
export class ArticleController {
  constructor(
    @InjectModel('Entry') private entryModel: Model<Entry>,
    private readonly articleService: ArticleService,
    private readonly entryService: EntryService,
  ) {}

  // 按照发布时间获取文章列表 /article/latest?limit=20&page=1&lang=zh-CN
  @Get('latest')
  async getArticlesByPublishDate(
    @Query('limit', PositiveIntPipe) limit: number = 20,
    @Query('page', PositiveIntPipe) page: number = 1,
    @Query('lang') lang: string,
  ) {
    return await this.articleService.getArticlesByPublishDate(
      limit,
      page,
      lang,
    );
  }

  // 获取推荐文章列表 /article/featured?limit=20&page=1&lang=zh-CN
  @Get('featured')
  async getFeaturedArticles(
    @Query('limit', PositiveIntPipe) limit: number = 20,
    @Query('page', PositiveIntPipe) page: number = 1,
    @Query('lang') lang: string,
  ) {
    return await this.articleService.getFeaturedArticles(limit, page, lang);
  }

  // 获取特定分类文章列表 /article/category/:category?limit=20&page=1&lang=zh-cn
  @Get('category/:category')
  async getArticlesByCategory(
    @Param('category') category: string,
    @Query('limit', PositiveIntPipe) limit: number = 20,
    @Query('page', PositiveIntPipe) page: number = 1,
    @Query('lang') lang: string = 'zh-cn',
  ) {
    return await this.articleService.getArticlesByCategory(
      category,
      limit,
      page,
      lang,
    );
  }

  // 获取文章详情 /article/detail?slug=&id=&lang=zh-CN GET
  @Get('detail')
  async getArticleDetail(
    @Query('slug') slug?: string,
    @Query('id') id?: string,
    @Query('lang') lang?: string,
  ) {
    if (!slug && !id) {
      throw new HttpException(
        'Either slug or id must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (slug) {
      return await this.articleService.getArticleDetailBySlug(slug, lang);
    } else {
      return await this.articleService.getArticleDetailById(id);
    }
  }

  // 创建文章 /article/add POST
  @Post('add')
  async createArticle(@Query('lang') lang?: string) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 创建entry
      const newEntry = await this.entryService.createEntry(EntryType.Article);

      // 创建article
      const newArticle = await this.articleService.createArticle(
        newEntry._id,
        newEntry.slug,
        session,
        lang,
      );

      // 将article._id写入entry的[lang]字段
      await this.entryService.setEntry(
        newEntry._id,
        newArticle._id,
        newArticle.lang,
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      return await this.articleService.getArticleDetailById(newArticle._id);
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(
        `Failed to create article: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 发布文章
  @Patch('publish/:article')
  async publishArticle(@Param('article') article: mongoose.Types.ObjectId) {
    return await this.articleService.publishArticle(article);
  }

  // 取消发布文章
  @Patch('unpublish/:article')
  async unpublishArticle(@Param('article') article: mongoose.Types.ObjectId) {
    return await this.articleService.unpublishArticle(article);
  }

  // 创建其他语言版本文章 /article/add-lang/:entryId?lang=en POST
  async createArticleLanguageVersion(
    @Param('entryId') entryId: string,
    @Query('lang') lang: string,
  ) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 获取原始版本的entry
      const entry = await this.entryService.getEntry(entryId);

      // 创建新的photo
      const newArticle = await this.articleService.createArticle(
        entry._id,
        entry.slug,
        session,
        lang,
      );

      // 将photo._id写入entry对应[lang]字段
      await this.entryService.setEntry(
        entry._id,
        newArticle._id,
        lang,
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      return await this.articleService.getArticleDetailById(newArticle._id);
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 补充文章信息（除正文以外）/article/update/:article PATCH
  @Patch('update/:article')
  async updateArticle(
    @Param('article') article: mongoose.Types.ObjectId,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return await this.articleService.updateArticle(
      article,
      updateArticleDto.title,
      updateArticleDto.description,
      updateArticleDto.abstract,
      updateArticleDto.is_featured,
      updateArticleDto.is_top,
      updateArticleDto.is_premium,
      updateArticleDto.category,
      updateArticleDto.cover,
    );
  }

  // 更新正文 /article/update-content/:article PATCH
  @Patch('update-content/:article')
  async updateArticleContent(
    @Param('article') article: mongoose.Types.ObjectId,
    @Body() content: string,
  ) {
    return await this.articleService.updateArticleContent(article, content);
  }

  // 修改slug /article/update-slug/:entryId?slug= POST
  @Post('update-slug/:entryId')
  async changePhotoSlug(
    @Param('entryId') entryId: string,
    @Query('slug') slug: string,
  ) {
    return await this.entryService.updateSlug(entryId, slug);
  }

  // 获取文章所有可用语言版本 /article/get-langs/:entryId GET
  @Get('get-langs/:entryId')
  async getPhotoVersions(@Param('entryId') entryId: string) {
    return await this.entryService.getAvailableLangs(entryId);
  }

  // 删除文章 /article/delete/:article DELETE
  @Delete('delete/:article')
  async deleteArticle(@Param('article') article: string) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 删除photo
      const deletedArticle = await this.articleService.deleteArticle(article);

      // 删除entry[lang]
      await this.entryService.deleteEntry(
        deletedArticle.entry.toString(),
        deletedArticle.lang,
      );

      await session.commitTransaction();
      await session.endSession();

      return {
        status: 'success',
        message: 'Article deleted',
      };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
