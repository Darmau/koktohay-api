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
      const result = await this.prisma.$transaction(async () => {
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

  // 删除想法，不删除附属图片
  async deleteThoughtWithoutImages(id: number) {
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
      throw new HttpException('Error deleting thought', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 删除想法以及附属图片
  async deleteThoughtWithImages(id: number) {
    try {
      const result = await this.prisma.$transaction([
        this.prisma.image.deleteMany({
          where: {
            thought_id: id
          }
        }),
        this.prisma.thought.delete({
          where: {
            id: id
          }
        })
      ]);
      this.logger.debug(`Successfully deleted thought and images: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting thought: ${error}`);
      throw new HttpException('Error deleting thought', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 批量获取想法
  async getThoughts(page: number, limit: number) {
    return this.prisma.thought.findMany({
      skip: (page - 1) * limit,
      take: Number(limit),
      select: {
        id: true,
        content: true,
        location: true,
        images: {
          select: {
            id: true,
            date: true,
            time: true,
            file_name: true,
            format: true,
          }
        },
        _count: {
          select: {
            comment: true
          }
        }
      }
    });
  }

  // 获取想法详情
  async getThoughtDetail(slug: string) {
    return this.prisma.thought.findUnique({
      where: {
        slug: slug
      },
      select: {
        id: true,
        content: true,
        location: true,
        images: {
          select: {
            date: true,
            time: true,
            file_name: true,
            format: true,
          }
        },
        _count: {
          select: {
            comment: true
          }
        }
      }
    });
  }

  // 修改想法
  async updateThought(slug: string, content?: string, location?: string, images?: number[]) {
    try {
      const result = await this.prisma.$transaction(async () => {
        const thought = await this.prisma.thought.update({
          where: {
            slug: slug
          },
          data: {
            content: content,
            location: location,
          }
        });

        // 如果有新的图片，就更新关联
        if (images && images.length > 0) {
          // 先清除现有图片与thought的关联
          await this.prisma.image.updateMany({
            where: {
              thought_id: result.id
            },
            data: {
              thought_id: null
            }
          });
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

        // 返回更新后的thought
        return this.prisma.thought.findUnique({
          where: {
            id: thought.id
          },
          select: {
            id: true,
            content: true,
            location: true,
            images: {
              select: {
                date: true,
                time: true,
                file_name: true,
                format: true,
              }
            },
            _count: {
              select: {
                comment: true
              }
            }
          }
        });
      });
      this.logger.debug(`Successfully update thought: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating thought: ${error}`);
      throw new HttpException('Error updating thought', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
