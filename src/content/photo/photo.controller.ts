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
import { PhotoService } from '@/content/photo/photo.service';
import { EntryService } from '@/content/entry/entry.service';
import { PositiveIntPipe } from '@/pipe/positiveInt.pipe';
import { Photo } from '@/schemas/photo.schema';
import { EntryType } from '@/enum/entry.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Entry } from '@/schemas/entry.schema';
import mongoose, { Model } from 'mongoose';
import { UpdatePhotoDto } from '@/dto/updatePhoto.dto';

@Controller('photo')
export class PhotoController {
  constructor(
    @InjectModel('Entry') private entryModel: Model<Entry>,
    private readonly photoService: PhotoService,
    private readonly entryService: EntryService,
  ) {}

  // 获取摄影作品列表 /photo/latest?limit=20&page=1&lang=zh-CN
  @Get('latest')
  async getPhotosByShootingTime(
    @Query('limit', PositiveIntPipe) limit: number = 20,
    @Query('page', PositiveIntPipe) page: number = 1,
    @Query('lang') lang: string,
  ) {
    return await this.photoService.getPhotosByShootingTime(limit, page, lang);
  }

  // 获取特定分类摄影作品列表 /photo/category/:category?limit=20&page=1&lang=zh-cn
  @Get('category/:category')
  async getPhotosByCategory(
    @Param('category') category: string,
    @Query('limit', PositiveIntPipe) limit: number = 20,
    @Query('page', PositiveIntPipe) page: number = 1,
    @Query('lang') lang: string,
  ) {
    return await this.photoService.getPhotosByCategory(
      category,
      limit,
      page,
      lang,
    );
  }

  // 获取摄影作品详情 /photo/detail?slug=&id=&lang=zh-cn GET
  @Get('detail')
  async getPhotoDetail(
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
      return await this.photoService.getPhotoDetailBySlug(slug, lang);
    } else {
      return await this.photoService.getPhotoDetailById(id);
    }
  }

  // 创建摄影作品 /photo/add POST
  @Post('add')
  async createPhoto(@Query('lang') lang?: string) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 创建entry
      const newEntry = await this.entryService.createEntry(EntryType.Photo);

      // 创建photo
      const newPhoto = await this.photoService.createPhoto(
        newEntry._id,
        newEntry.slug,
        session,
        lang,
      );

      // 将photo._id写入entry对应[lang]字段
      await this.entryService.setEntry(
        newEntry._id,
        newPhoto._id,
        newPhoto.lang,
        session,
      );

      await session.commitTransaction();
      await session.endSession();

      return await this.photoService.getPhotoDetailById(newPhoto._id);
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 创建其他语言版本摄影作品 /photo/add-lang/:entryId?lang=en POST
  @Post('add-lang/:entryId')
  async createPhotoLanguageVersion(
    @Param('entryId') entryId: string,
    @Query('lang') lang: string,
  ) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 获取原始版本的entry
      const entry = await this.entryService.getEntry(entryId);

      // 创建新的photo
      const newPhoto = await this.photoService.createPhoto(
        entry._id,
        entry.slug,
        session,
        lang,
      );

      // 将photo._id写入entry对应[lang]字段
      await this.entryService.setEntry(entry._id, newPhoto._id, lang, session);

      await session.commitTransaction();
      await session.endSession();

      return await this.photoService.getPhotoDetailById(newPhoto._id);
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 更新摄影作品信息 /photo/update/:photo PATCH
  @Patch('update/:photo')
  async updatePhoto(
    @Param('photo') photo: mongoose.Types.ObjectId,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    return await this.photoService.updatePhoto(
      photo,
      updatePhotoDto.title,
      updatePhotoDto.description,
      updatePhotoDto.abstract,
      updatePhotoDto.is_featured,
      updatePhotoDto.is_top,
      updatePhotoDto.category,
      updatePhotoDto.cover,
      updatePhotoDto.gallery,
    );
  }

  // 修改slug /photo/update-slug/:entryId?slug= POST
  @Post('update-slug/:entryId')
  async changePhotoSlug(
    @Param('entryId') entryId: string,
    @Query('slug') slug: string,
  ) {
    return await this.entryService.updateSlug(entryId, slug);
  }

  // 发布摄影作品 /photo/publish/:photo PATCH
  @Patch('publish/:photo')
  async publishPhoto(
    @Param('photo') photo: mongoose.Types.ObjectId,
  ): Promise<Photo> {
    return await this.photoService.publishPhoto(photo);
  }

  // 取消发布摄影作品 /photo/unpublish/:photo PATCH
  @Patch('unpublish/:photo')
  async unpublishPhoto(
    @Param('photo') photo: mongoose.Types.ObjectId,
  ): Promise<Photo> {
    return await this.photoService.unpublishPhoto(photo);
  }

  // 获取指定作品所有语言版本 /photo/get-langs/:entryId GET
  @Get('get-langs/:entryId')
  async getPhotoVersions(@Param('entryId') entryId: string) {
    return await this.entryService.getAvailableLangs(entryId);
  }

  // 删除摄影作品 /photo/delete/:photo DELETE
  @Delete('delete/:photo')
  async deletePhoto(@Param('photo') photo: string) {
    const session = await this.entryModel.db.startSession();
    session.startTransaction();

    try {
      // 删除photo
      const deletedPhoto = await this.photoService.deletePhoto(photo);

      // 删除entry[lang]
      await this.entryService.deleteEntry(
        deletedPhoto.entry.toString(),
        deletedPhoto.lang,
      );

      await session.commitTransaction();
      await session.endSession();

      return {
        status: 'success',
        message: 'Photo deleted',
      };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
