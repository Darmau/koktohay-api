import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
  async onModuleInit() {
    // 增加3秒延迟，等待数据库连接
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('PrismaService is connected');
    await this.$connect();
  }
}
