import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  Get, Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(
    @InjectQueue('image') private readonly imageQueue: Queue,
    private readonly imageService: ImageService,
  ) {}

  private readonly logger = new Logger(ImageController.name);

  // 上传图片
  // /image/upload POST
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 30000000 })],
      }),
    )
    image: Express.Multer.File,
  ) {
    // 上传原始图片
    this.logger.debug('Uploading raw image');
    const rawImageData = await this.imageService.extractExifAndUploadRaw(image);

    // 将图片处理任务加入队列，异步执行
    this.logger.debug('Adding image process task to queue');
    await this.imageQueue.add(
      'image-process',
      {
        id: rawImageData.id,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 30000,
      },
    );
    return rawImageData;
  }

  // 重新执行某张图片的异步任务
  // /image/retry/:id GET
  @Get('retry/:id')
  async retryImageProcess(@Param('id') id: string) {
    await this.imageQueue.add(
      'image-process',
      {
        id: id,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 60000,
      },
    );
    return {
      message: 'Success added to queue',
    };
  }

  // 获取指定图片
  // /image/get/:id GET
  @Get('get/:id')
  async getImage(@Param('id') id: number) {
    return await this.imageService.getImage(id);
  }

  // 批量获取图片的thunbnail
  // /image/latest?limit=10&page=1 GET
  @Get('latest')
  async getLatestThumbnails(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return await this.imageService.getLatestThumbnails(Number(limit), Number(page));
  }

  // 删除指定图片
  // /image/delete/:id DELETE
  @Delete('delete/:id')
  async deleteImage(@Param('id') id: number) {
    return await this.imageService.deleteImage(id);
  }

  // 替换图片
  // /image/replace/:id PATCH
  @Patch('replace/:id')
  @UseInterceptors(FileInterceptor('image'))
  async replaceImage(
    @Param('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 20971520 })],
      }),
    )
    image: Express.Multer.File,
  ) {
    await this.imageService.replaceImageRaw(id, image);
    await this.imageQueue.add(
      'image-process',
      {
        id: id,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
        timeout: 60000,
      },
    );
    const newImageData = await this.imageService.getImage(id);
    return newImageData;
  }

  // 修改图片信息
  // /image/update/:id PATCH
  @Patch('update/:id')
  async updateImage(@Param('id') id: number, @Body() body: Record<string, string>) {
    return await this.imageService.updateImage(id, body);
  }
}
