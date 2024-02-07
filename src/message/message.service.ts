import {Injectable} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";
import {ContactType} from "@/message/sendMessage.dto";

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {
  }

  // 发送站内信
  async sendMessage(name: string, message: string, contact_type: ContactType, contact_detail: string) {
    return this.prisma.message.create({
      data: {
        name: name,
        message: message,
        contact_type: contact_type,
        contact_detail: contact_detail,
        is_read: false,
      }
    });
  }

  // 标记为已读
  async readMessage(messages: number[]) {
    return this.prisma.message.updateMany({
      where: {
        id: {
          in: messages
        }
      },
      data: {
        is_read: true
      }
    });
  }

  // 获取站内信列表
  async getMessages(page: number, limit: number) {
    return this.prisma.message.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // 获取站内信详情
  async getMessageDetail(id: number) {
    return this.prisma.message.findUnique({
      where: {
        id: id
      }
    })
  }

  // 删除站内信
  async deleteMessage(messages: number[]) {
    return this.prisma.message.deleteMany({
      where: {
        id: {
          in: messages
        }
      }
    });
  }
}
