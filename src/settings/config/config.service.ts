import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '@/schemas/settings.schema';

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel('Settings') private settingsModel: Model<Settings>,
  ) {}

  private readonly logger = new Logger(ConfigService.name);

  // 查找地图API
  async getMapApi() {
    const mapApi = await this.settingsModel.findOne({ name: 'map' }).exec();
    if (!mapApi) {
      throw new HttpException('No map API found', HttpStatus.NOT_FOUND);
    }
    return mapApi.config;
  }

  // 修改地图API
  async updateMapApi(mapApi: string) {
    try {
      const mapConfig = await this.settingsModel
        .findOne({ name: 'map' })
        .exec();
      if (mapConfig) {
        return await this.settingsModel
          .findOneAndUpdate(
            { name: 'map' },
            {
              config: {
                AMAP_KEY: mapApi,
              },
            },
          )
          .exec();
      } else {
        const map = new this.settingsModel({
          name: 'map',
          config: {
            AMAP_KEY: mapApi,
          },
        });
        await map.save();
        return map;
      }
    } catch (error) {
      this.logger.error(`Update map API failed: ${error.message}`);
      throw new HttpException(
        `Update map API failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 删除地图API
  async deleteMapApi() {
    try {
      return await this.settingsModel.findOneAndDelete({ name: 'map' }).exec();
    } catch (error) {
      this.logger.error(`Delete map API failed: ${error.message}`);
      throw new HttpException(
        `Delete map API failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 查找S3配置
  async getS3Config() {
    const S3Config = await this.settingsModel.findOne({ name: 's3' }).exec();
    if (!S3Config) {
      throw new HttpException('No S3 config found', HttpStatus.NOT_FOUND);
    }
    return S3Config.config;
  }

  // 修改S3配置
  async updateS3Config(
    S3_REGION: string,
    S3_ENDPOINT: string,
    S3_ACCESS_ID: string,
    S3_SECRET_KEY: string,
    S3_BUCKET: string,
    S3_URL_PREFIX: string,
  ) {
    try {
      const S3Config = await this.settingsModel.findOne({ name: 's3' }).exec();
      if (S3Config) {
        return await this.settingsModel
          .findOneAndUpdate(
            { name: 's3' },
            {
              config: {
                S3_REGION,
                S3_ENDPOINT,
                S3_ACCESS_ID,
                S3_SECRET_KEY,
                S3_BUCKET,
                S3_URL_PREFIX,
              },
            },
          )
          .exec();
      } else {
        const s3 = new this.settingsModel({
          name: 's3',
          config: {
            S3_REGION,
            S3_ENDPOINT,
            S3_ACCESS_ID,
            S3_SECRET_KEY,
            S3_BUCKET,
            S3_URL_PREFIX,
          },
        });
        await s3.save();
        return s3.config;
      }
    } catch (error) {
      this.logger.error(`Update S3 config failed: ${error.message}`);
      throw new HttpException(
        `Update S3 config failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 删除S3配置
  async deleteS3Config() {
    try {
      return await this.settingsModel.findOneAndDelete({ name: 's3' }).exec();
    } catch (error) {
      this.logger.error(`Delete S3 config failed: ${error.message}`);
      throw new HttpException(
        `Delete S3 config failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
