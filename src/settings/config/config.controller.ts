import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ConfigService } from './config.service';
import { AddS3ConfigDto } from '@/dto/addS3Config.dto';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}
  // 获取S3配置
  @Get('s3')
  async getS3Config() {
    return await this.configService.getS3Config();
  }

  // 修改S3配置
  @Post('s3')
  async updateS3Config(@Body() addS3ConfigDto: AddS3ConfigDto) {
    return await this.configService.updateS3Config(
      addS3ConfigDto.S3_REGION,
      addS3ConfigDto.S3_ENDPOINT,
      addS3ConfigDto.S3_ACCESS_ID,
      addS3ConfigDto.S3_SECRET_KEY,
      addS3ConfigDto.S3_BUCKET,
      addS3ConfigDto.S3_URL_PREFIX,
    );
  }

  // 删除S3配置
  @Delete('s3')
  async deleteS3Config() {
    return await this.configService.deleteS3Config();
  }

  // 获取地图API
  @Get('map')
  async getMapApi() {
    return await this.configService.getMapApi();
  }

  // 更新地图API
  @Post('map')
  async updateMapApi(@Query('api') api: string) {
    return await this.configService.updateMapApi(api);
  }

  // 删除地图API
  @Delete('map')
  async deleteMapApi() {
    return await this.configService.deleteMapApi();
  }
}
