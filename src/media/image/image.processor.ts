import extractFolderName from '@/utils/extract-folder-filename';
import uploadToR2 from '@/utils/upload-to-R2';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Process, Processor } from '@nestjs/bull';
import { HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import sharp from 'sharp';
import { Image } from 'src/schemas/image.schema';
import { ConfigService } from '@/settings/config/config.service';

// 本文件用于异步执行图片处理任务
@Processor('image')
export class ImageProcessor {
  constructor(
    @InjectModel('Image') private ImageModel: Model<Image>,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(ImageProcessor.name);

  private readonly resolutions: Map<string, number> = new Map([
    ['small', 640],
    ['medium', 1280],
    ['large', 2560],
  ]);
  private readonly formats = {
    opaque: ['jpeg', 'webp', 'avif'],
    transparent: ['png', 'webp', 'avif'],
  };

  // 本队列任务接收文件，数据库id，文件夹名，文件名
  @Process('image-process')
  async uploadImages(job: Job<{ id: string }>) {
    // 从数据库中读取数据
    const imageData = await this.ImageModel.findById(job.data.id);
    const { folder, fileName } = extractFolderName(imageData.raw);

    // 如果是svg和gif格式，停止处理
    if (imageData.format === 'svg' || imageData.format === 'gif') {
      return HttpStatus.OK;
    }

    const S3Config = await this.configService.getS3Config();

    // 从imageData.raw中下载图片并转换为buffer
    const getCommand = new GetObjectCommand({
      Bucket: S3Config.S3_BUCKET,
      Key: imageData.raw,
    });

    const S3 = new S3Client({
      region: S3Config.S3_REGION,
      endpoint: S3Config.S3_ENDPOINT,
      credentials: {
        accessKeyId: S3Config.S3_ACCESS_ID,
        secretAccessKey: S3Config.S3_SECRET_KEY,
      },
    });

    const stream = await S3.send(getCommand);
    const imageFile = await stream.Body.transformToByteArray();

    const formatList =
      this.formats[imageData.hasAlpha ? 'transparent' : 'opaque'];

    const imageStack = {
      large: {},
      medium: {},
      small: {},
    };

    for (const [label, target] of this.resolutions) {
      const edge = imageData.width > imageData.height ? 'width' : 'height';
      // 对于小于目标分辨率的图片，按照图片分辨率处理
      const resolution = imageData[edge] > target ? target : imageData[edge];

      const resizedImage = await this.resizeImage(resolution, edge, imageFile);

      for (const format of formatList) {
        const convertedImage = await this.convertImage(format, resizedImage);
        const key = `${folder}/${fileName}-${label}.${format}`;
        this.logger.debug(`Uploading ${key}`);
        await uploadToR2(key, convertedImage, S3Config);
        imageStack[label][format] = key;
      }
    }

    // 更新数据库
    await this.ImageModel.findByIdAndUpdate(job.data.id, {
      large: imageStack.large,
      medium: imageStack.medium,
      small: imageStack.small,
    });

    this.logger.log(`Successfully processed ${fileName}.${imageData.format}`);
    return HttpStatus.OK;
  }

  // 缩放图片
  private async resizeImage(
    resolution: number,
    edge: string,
    image: Uint8Array,
  ): Promise<Buffer> {
    try {
      const resizedImage = await sharp(image)
        .resize({ [edge]: resolution })
        .toBuffer();
      if (!resizedImage || resizedImage.length === 0) {
        throw new Error('Resized image is missing or empty');
      }
      return resizedImage;
    } catch (error) {
      this.logger.error(`Error resizing image: ${error.message}`);
      throw error;
    }
  }

  // 图片转码
  private async convertImage(format: string, image: Buffer): Promise<Buffer> {
    switch (format) {
      case 'jpeg': {
        return await sharp(image)
          .jpeg({ mozjpeg: true, progressive: true, quality: 75 })
          .toBuffer();
      }
      case 'png': {
        return await sharp(image).png({ progressive: true }).toBuffer();
      }
      case 'webp': {
        return await sharp(image).webp({ quality: 80 }).toBuffer();
      }
      case 'avif': {
        return await sharp(image).avif({ quality: 60 }).toBuffer();
      }
      default: {
        return await sharp(image)
          .jpeg({ mozjpeg: true, progressive: true })
          .toBuffer();
      }
    }
  }
}
