import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '@/schemas/settings.schema';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class ConfigService {
  constructor(
    @InjectModel('Settings') private settingsModel: Model<Settings>,
    private prisma: PrismaService,
  ) {}

  private readonly logger = new Logger(ConfigService.name);

  // 获取指定配置
  async getKeyValue(key: string) {
    return this.prisma.config.findUnique({
      where: {
        name: key
      },
      select: {
        name: true,
        value: true
      }
    })
  }

  // 添加API配置
  async addKey(key: string, value: string) {
    return this.prisma.config.create({
      data: {
        name: key,
        value: value,
      }
    });
  }

  // 删除指定API配置
  async deleteKey(key: string) {
    return this.prisma.config.delete({
      where: {
        name: key
      }
    });
  }

  // 修改API配置
  async updateKey(key: string, value: string) {
    return this.prisma.config.update({
      where: {
        name: key
      },
      data: {
        value: value
      }
    });
  }

  // 一次性获取所有S3相关配置
  async getS3Config() {
    const configs = await this.prisma.config.findMany({
      where: {
        name: {
          startsWith: 'S3'
        }
      },
      select: {
        name: true,
        value: true
      }
    });
    // 将[{key, value}, {key, value}]转换为{key: value, key: value}
    return configs.reduce((acc, cur) => {
      return { ...acc, [cur.name]: cur.value };
    }, {});
  }
}
