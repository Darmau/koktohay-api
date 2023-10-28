import deleteObjects from '@/utils/delete-objects';
import extractFolderName from '@/utils/extract-folder-filename';
import extractKey from '@/utils/extract-key';
import getLocation from '@/utils/get-location';
import UploadRawImage from '@/utils/upload-raw-image';
import uploadToR2 from '@/utils/upload-to-R2';
import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import exifr from 'exifr';
import {Model} from 'mongoose';
import sharp from 'sharp';
import {Image} from '@/schemas/image.schema';
import {ConfigService} from '@/settings/config/config.service';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private EXIF = null;
  private location = null;

  constructor(
      @InjectModel('Image') private imageModel: Model<Image>,
      private readonly configService: ConfigService,
  ) {
  }

  // 上传原始图片并提取信息
  async extractExifAndUploadRaw(file: Express.Multer.File): Promise<Image> {
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
    const {
      upload_time,
      key
    } = await new UploadRawImage(file, S3Config).upload();

    // 提取基础信息
    const metadata = await sharp(file.buffer).metadata();

    if (metadata.format === 'svg' || metadata.format === 'gif') {
      const svgImageData = new this.imageModel({
        raw: key,
        format: metadata.format,
        alt: file.originalname,
        upload_time: upload_time,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        hasAlpha: metadata.hasAlpha,
      });
      await svgImageData.save();
      return svgImageData;
    }

    // 提取EXIF信息
    this.EXIF = await exifr.parse(file.buffer);

    // 重置location
    this.location = null;

    if (this.EXIF?.latitude && this.EXIF?.longitude) {
      const AMAP_KEY = await this.getMapAPI();
      // 获取地理位置信息
      this.location = await getLocation(
          AMAP_KEY,
          this.EXIF.longitude,
          this.EXIF.latitude,
      );
    }

    try {
      // 将信息存入Mongo DB
      const rawImageData = new this.imageModel({
        raw: key,
        format: metadata.format,
        upload_time: upload_time,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
        hasAlpha: metadata.hasAlpha,
        alt: file.originalname,
        exif: {
          maker: this.EXIF?.Make,
          model: this.EXIF?.Model,
          exposure_time: this.EXIF?.ExposureTime,
          aperture: this.EXIF?.FNumber,
          iso: this.EXIF?.ISO,
          focal_length: this.EXIF?.FocalLength,
          lens_model: this.EXIF?.LensModel,
        },
        gps: {
          latitude: this.EXIF?.latitude,
          longitude: this.EXIF?.longitude,
        },
        location: this.location,
        shooting_time: this.EXIF?.DateTimeOriginal,
      });
      await rawImageData.save();
      return rawImageData;
    } catch (error) {
      this.logger.error(`Failed to save RAW image to MongoDB: ${error}`);
      throw new HttpException(
          'Failed to save RAW image to MongoDB',
          HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 获取指定图片的信息
  async getImage(id: string) {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const S3Config = await this.configService.getS3Config();
    const imageObject = image.toObject();
    return {
      ...imageObject,
      raw: await this.addPrefixUrl(imageObject.raw, S3Config.S3_URL_PREFIX),
      large: await this.addPrefixUrl(imageObject.large, S3Config.S3_URL_PREFIX),
      medium: await this.addPrefixUrl(imageObject.medium, S3Config.S3_URL_PREFIX),
      small: await this.addPrefixUrl(imageObject.small, S3Config.S3_URL_PREFIX),
    };
  }

  // 删除指定图片
  async deleteImage(id: string): Promise<Image> {
    const deletedImage = await this.imageModel.findByIdAndDelete(id);
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
    const images = await this.imageModel
    .find()
    .sort({upload_time: -1})
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
    if (!images) {
      throw new HttpException('No image for now', HttpStatus.NOT_FOUND);
    }
    const S3Config = await this.configService.getS3Config();
    return await Promise.all(images.map(async (image) => {
      return await this.addPrefixUrl(image.small, S3Config.S3_URL_PREFIX);
    }));
  }

  // 替换图片的raw字段
  async replaceImageRaw(id: string, file: Express.Multer.File): Promise<Image> {
    const imageData = await this.imageModel.findById(id).exec();
    const format = file.mimetype.split('/').pop();
    if (!imageData) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const {folder, fileName} = extractFolderName(imageData.raw);
    const key = `${folder}/${fileName}-raw.${format}`;
    // 获取cloudflare配置
    const S3Config = await this.configService.getS3Config();

    await uploadToR2(key, file.buffer, S3Config);
    return imageData;
  }

  // 修改图片
  async updateImage(id: string, body: Partial<Image>) {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    await this.imageModel.findByIdAndUpdate(id, body);
    const updatedImage = await this.imageModel.findById(id).exec();
    return updatedImage;
  }

  // 根据图片id获取相应的key，并拼装为实际可用的URL
  async getImageUrl(id: string) {
    const image = await this.imageModel.findById(id).exec();
    if (!image) {
      this.logger.error(`Image not found: ${id}`);
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    const S3Config = await this.configService.getS3Config();
    return {
      raw: await this.addPrefixUrl(image.raw, S3Config.S3_URL_PREFIX),
      large: await this.addPrefixUrl(image.large, S3Config.S3_URL_PREFIX),
      medium: await this.addPrefixUrl(image.medium, S3Config.S3_URL_PREFIX),
      small: await this.addPrefixUrl(image.small, S3Config.S3_URL_PREFIX),
    };
  }

  private async addPrefixUrl(formats, prefix: string) {
    // raw
    if (typeof formats === 'string') {
      return `${prefix}/${formats}`;
    } else {
      // 其他尺寸
      const urls =  Object.entries(formats).reduce((acc, [key, value]) => {
        return { ...acc, [key]: `${prefix}/${value}` };
      }, {});
      return urls;
    }
  }

  // 获取地图API
  private async getMapAPI() {
    return await this.configService.getMapApi();
  }
}
