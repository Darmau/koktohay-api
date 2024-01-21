import {Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";
import { v5 as uuidv5 } from 'uuid';

@Injectable()
export class ThoughtService {
  constructor(private prisma: PrismaService) {}

  private readonly logger = new Logger(ThoughtService.name);

  // 发布想法 将content和image数组传入
  async postThought(content: string, location?: string, images?: number[]) {
    const result = await this.prisma.$transaction(async (prisma) => {
      const thought = await this.prisma.thought.create({
        data: {
          content: content,
          location: location,
        }
      });

      if (images && images.length > 0) {
        this.logger.debug('Images are not empty, start to add images');
        await Promise.all(
            images.map((image) => {
              return this.prisma.image.update({
                where: {
                  id: image
                },
                data: {
                  thought_id: thought.id
                }
              })
            })
        )
      }

      return thought;
    });
    this.logger.debug(`Successfully post thought: ${JSON.stringify(result)}`);
    return result;
  }

  // 删除想法

  // 修改想法

  // 批量获取想法

  // 获取想法详情及附属评论
}
