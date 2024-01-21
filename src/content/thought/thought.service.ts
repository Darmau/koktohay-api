import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class ThoughtService {
  private readonly logger = new Logger(ThoughtService.name);

  constructor(private prisma: PrismaService) {
  }

  // 发布想法 将content和image数组传入
  async postThought(content: string, location?: string, images?: number[]) {
    try {
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
    } catch (error) {
      this.logger.error(`Error posting thought: ${error}`);
      // Handle the error appropriately
      throw new HttpException('Error posting thought', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 删除想法
  async deleteThought(id: number) {
    try {
      const result = await this.prisma.$transaction([
        this.prisma.image.updateMany({
          where: {
            thought_id: id
          },
          data: {
            thought_id: null
          }
        }),
        this.prisma.thought.delete({
          where: {
            id: id
          }
        })
      ]);

      this.logger.debug(`Successfully deleted thought and updated images: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting thought: ${error}`);
      // Handle the error appropriately
      throw new HttpException('Error deleting thought', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 修改想法

  // 批量获取想法

  // 获取想法详情及附属评论
}
