import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '@/schemas/category.schema';
import { EntryType } from '@/enum/entry.enum';
import { Article } from '@/schemas/article.schema';
import { UpdateCategoryDto } from '@/dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    @InjectModel('Article') private articleModel: Model<Article>,
  ) {}

  private readonly logger = new Logger(CategoryService.name);

  // 获取特定type的所有分类
  async getCategory(type: string): Promise<Category[]> {
    return await this.categoryModel.find({ type: type }).exec();
  }

  // 创建分类
  async createCategory(type: string): Promise<Category> {
    // 检查type是否在entry.enum中
    if (!Object.values(EntryType).includes(type as EntryType)) {
      throw new HttpException('Invalid category type', HttpStatus.BAD_REQUEST);
    }
    // 新建分类
    const newCategory = new this.categoryModel({
      type: type,
    });
    await newCategory.save();
    return newCategory;
  }

  // 补充分类信息
  async updateCategory(id: string, info: UpdateCategoryDto) {
    return await this.categoryModel.findByIdAndUpdate(id, info).exec();
  }

  // 删除分类 并将所有分类下的条目的分类信息置空
  async deleteCategory(slug: string) {
    const category = await this.categoryModel.findOne({ slug: slug }).exec();
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    const session = await this.categoryModel.startSession();
    session.startTransaction();

    try {
      const articles = await this.articleModel.find({ category: slug }).exec();
      const updatePromises = articles.map(async (article) => {
        article.category = 'unset';
        await article.save();
      });

      await Promise.all(updatePromises);
      await this.categoryModel.findOneAndDelete({ slug: slug }).exec();

      await session.commitTransaction();
      await session.endSession();

      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();

      this.logger.error(`delete category ${slug} failed: ${error})`);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
