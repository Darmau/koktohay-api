import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CategoryService } from '@/category/category.service';
import { UpdateCategoryDto } from '@/dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 获取特定type的所有分类
  @Get('all/:category')
  async getCategory(@Param('category') category: string) {
    return await this.categoryService.getCategory(category);
  }

  // 添加分类
  @Post('add/:type')
  async addCategory(@Param('type') type: string) {
    return await this.categoryService.createCategory(type);
  }

  // 补充分类信息
  @Patch('update/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategory: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateCategory(id, updateCategory);
  }

  // 删除分类
  @Delete('delete/:slug')
  async deleteCategory(@Param('slug') slug: string) {
    return await this.categoryService.deleteCategory(slug);
  }
}
