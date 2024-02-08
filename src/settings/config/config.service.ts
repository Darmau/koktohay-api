import {Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(
      private prisma: PrismaService,
  ) {
  }

  // 获取指定配置
  async getKeyValue(name: string) {
    return this.prisma.config.findUnique({
      where: {
        name: name
      },
      select: {
        name: true,
        value: true
      }
    })
  }

  // 添加API配置
  async addKey(key: string, value: string) {
    this.logger.debug(`add key: ${key}, value: ${value}`);
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
  async getS3Config(): Promise<Record<string, string>> {
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
      return {...acc, [cur.name]: cur.value};
    }, {});
  }
}
