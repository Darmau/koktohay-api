import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { AddS3ConfigDto } from '@/dto/addS3Config.dto';
import {SendConfigDto} from "@/dto/sendConfig.dto";

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // 添加配置
  @Post()
  async addKey(@Body() sendConfigDto: SendConfigDto) {
    return await this.configService.addKey(
      sendConfigDto.name,
      sendConfigDto.value,
    );
  }

  // 删除配置
  @Delete()
  async deleteKey(@Query('name') name: string) {
    return await this.configService.deleteKey(name);
  }

  // 获取配置
  @Get()
  async getKeyValue(@Query('name') name: string) {
    return await this.configService.getKeyValue(name);
  }

   // 更新配置
  @Patch()
  async updateKey(@Body() sendConfigDto: SendConfigDto) {
    return await this.configService.updateKey(
      sendConfigDto.name,
      sendConfigDto.value,
    );
  }

  // 获取所有S3相关配置
  @Get('storage')
  async getS3Config() {
    return await this.configService.getS3Config();
  }
}
