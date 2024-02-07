import {
  Body,
  Controller,
  Delete,
  Get, Inject,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import {ConfigService} from './config.service';
import {SendConfigDto} from "@/settings/language/sendConfig.dto";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";

@Controller('config')
export class ConfigController {

  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly configService: ConfigService,
  ) {
  }

  // 添加配置
  @Post()
  async addKey(@Body() sendConfigDto: SendConfigDto) {
    const newConfig = await this.configService.addKey(
        sendConfigDto.name,
        sendConfigDto.value,
    );
    newConfig && await this.cacheManager.set(
          sendConfigDto.name,
          {name: sendConfigDto.name, value: sendConfigDto.value},
          0);
    return newConfig;
  }

  // 删除配置
  @Delete()
  async deleteKey(@Query('name') name: string) {
    const config = await this.configService.deleteKey(name);
    await this.cacheManager.del(name);
    return config;
  }

  // 获取配置
  @Get()
  async getKeyValue(@Query('name') name: string) {
    const configFromCache = await this.cacheManager.get(name);
    if (configFromCache) {
      return configFromCache;
    }
    const config = await this.configService.getKeyValue(name);
    config && await this.cacheManager.set(name, config, 0);
    return config;
  }

  // 更新配置
  @Patch()
  async updateKey(@Body() sendConfigDto: SendConfigDto) {
    const updateConfig = await this.configService.updateKey(
        sendConfigDto.name,
        sendConfigDto.value,
    );
    updateConfig && await this.cacheManager.set(
          sendConfigDto.name,
          {name: sendConfigDto.name, value: sendConfigDto.value},
          0);
    return updateConfig;
  }

  // 获取所有S3相关配置
  @Get('storage')
  async getS3Config() {
    const S3Config = await this.configService.getS3Config();
    S3Config && await this.cacheManager.set('S3Config', S3Config, 0);
    return S3Config;
  }
}
