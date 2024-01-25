import deleteObjects from '@/utils/delete-objects';
import extractFolderName from '@/utils/extract-folder-filename';
import extractKey from '@/utils/extract-key';
import getLocation from '@/utils/get-location';
import UploadRawImage from '@/utils/upload-raw-image';
import uploadToR2 from '@/utils/upload-to-R2';
import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import exifr from 'exifr';
import sharp from 'sharp';
import {ConfigService} from '@/settings/config/config.service';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
      private prisma: PrismaService,
      private readonly configService: ConfigService,
  ) {
  }

  // 上传原始图片并提取信息
  async extractExifAndUploadRaw(file: Express.Multer.File) {
    // 检查mine type，如果是heif格式返回报错
    if (file.mimetype === 'image/heif' || file.mimetype === 'image/heic') {
      throw new HttpException(
          'HEIF format is not supported',
          HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    // 获取cloudflare配置
    const S3Config = await this.configService.getS3Config();

    // 上传原始文件
    const rawData = await new UploadRawImage(file, S3Config).upload();

    // 提取基础信息
    const metadata = await sharp(file.buffer).metadata();

    if (metadata.format === 'svg' || metadata.format === 'gif') {
      return this.prisma.image.create({
        data: {
          file_name: rawData.filename,
          date: rawData.date,
          time: rawData.time,
          size: Number(file.size),
          width: metadata.width,
          height: metadata.height,
          has_alpha: metadata.hasAlpha,
          format: metadata.format,
        }
      });
    }

    // 提取EXIF信息
    const EXIF = await exifr.parse(file.buffer);
    let location = null

    if (EXIF?.latitude && EXIF?.longitude) {
      const mapApi = await this.configService.getKeyValue('MAP_AMAP');
      // 获取地理位置信息
      location = await getLocation(
          mapApi.value,
          EXIF.longitude,
          EXIF.latitude,
      );
    }

    return this.prisma.image.create({
      data: {
        file_name: rawData.filename,
        date: rawData.date,
        time: rawData.time,
        size: Number(file.size),
        width: metadata.width,
        height: metadata.height,
        has_alpha: metadata.hasAlpha,
        format: metadata.format,
        location: location,
        taken_at: EXIF?.DateTimeOriginal,
        exif: {
          maker: EXIF?.Make,
          model: EXIF?.Model,
          exposure_time: EXIF?.ExposureTime,
          aperture: EXIF?.FNumber,
          iso: EXIF?.ISO,
          focal_length: EXIF?.FocalLength,
          lens_model: EXIF?.LensModel,
        },
        gps: {
          latitude: EXIF?.latitude,
          longitude: EXIF?.longitude,
        },
      }
    });
  }

  // 获取指定图片的信息
  async getImage(id: number) {
    const image = await this.prisma.image.findUnique({
      where: {
        id: id
      }
    });
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const {S3_URL_PREFIX} = await this.configService.getS3Config();
    const folder = `${image.date}/${image.time}/${image.file_name}`;
    return {
      ...image,
      thumbnail: `${S3_URL_PREFIX}/${folder}-thumbnail.webp`,
      raw: `${S3_URL_PREFIX}/${folder}.${image.format}`,
      large: {
        [image.format]: `${S3_URL_PREFIX}/${folder}-large.jpeg`,
        webp: `${S3_URL_PREFIX}/${folder}-large.webp`,
        avif: `${S3_URL_PREFIX}/${folder}-large.avif`,
      },
      medium: {
        [image.format]: `${S3_URL_PREFIX}/${folder}-medium.jpeg`,
        webp: `${S3_URL_PREFIX}/${folder}-medium.webp`,
        avif: `${S3_URL_PREFIX}/${folder}-medium.avif`,
      },
      small: {
        [image.format]: `${S3_URL_PREFIX}/${folder}-small.jpeg`,
        webp: `${S3_URL_PREFIX}/${folder}-small.webp`,
        avif: `${S3_URL_PREFIX}/${folder}-small.avif`,
      },
    };
  }

  // 删除指定图片
  async deleteImage(id: number) {
    const deletedImage = await this.prisma.image.delete({
      where: {
        id: id
      }
    });
    if (!deletedImage) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    try {
      // 删除R2上的图片
      const imageList = extractKey(deletedImage);
      await deleteObjects(imageList);
      return deletedImage;
    } catch (error) {
      this.logger.error(`Failed to delete images from R2: ${error}`);
      throw new HttpException(
          'Failed to delete images from R2',
          HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // 获取图片thumbnail列表
  async getLatestThumbnails(limit: number = 10, page: number = 1) {
    const images = await this.prisma.image.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!images) {
      throw new HttpException('No image for now', HttpStatus.NOT_FOUND);
    }

    const {S3_URL_PREFIX} = await this.configService.getS3Config();
    return images.map((image) => {
      return {
        [image.format]: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.${image.format}`,
        avif: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.avif`,
        webp: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.webp`
      }
    });
  }

  // 替换图片的raw字段
  async replaceImageRaw(id: number, file: Express.Multer.File) {
    const imageData = await this.prisma.image.findUnique({
      where: {
        id: id
      }
    });
    const format = file.mimetype.split('/').pop();
    if (!imageData) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const {folder, fileName} = extractFolderName(imageData);
    const key = `${folder}/${fileName}-raw.${format}`;
    // 获取cloudflare配置
    const S3Config = await this.configService.getS3Config();

    await uploadToR2(key, file.buffer, S3Config);
    return imageData;
  }

  // 修改图片
  async updateImage(id: number, body: Record<string, string>) {
    const image = await this.prisma.image.findUnique({
      where: {
        id: id
      }
    });
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.image.update({
      where: {
        id: id
      },
      data: {
        ...body
      }
    });
  }

  // 根据图片id获取相应的key，并拼装为实际可用的URL
  async getImageUrl(id: number) {
    const image = await this.prisma.image.findUnique({
      where: {
        id: id
      },
      select: {
        date: true,
        time: true,
        file_name: true,
        format: true,
      }
    });

    if (!image) {
      this.logger.error(`Image not found: ${id}`);
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }

    const {S3_URL_PREFIX} = await this.configService.getS3Config();
    return {
      raw: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}.${image.format}`,
      large: {
        [image.format]: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-large.${image.format}`,
        avif: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-large.avif`,
        webp: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-large.webp`
      },
      medium: {
        [image.format]: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-medium.${image.format}`,
        avif: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-medium.avif`,
        webp: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-medium.webp`
      },
      small: {
        [image.format]: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.${image.format}`,
        avif: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.avif`,
        webp: `${S3_URL_PREFIX}/${image.date}/${image.time}/${image.file_name}-small.webp`
      }
    };
  }
}
