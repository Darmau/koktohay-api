import {Body, Controller, Delete, Get, Param, Post, Query} from '@nestjs/common';
import {SendMessageDto} from "@/dto/sendMessage.dto";
import {MessageService} from "@/message/message.service";

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {
  }

  // 发送站内信
  @Post('send')
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
    return await this.messageService.sendMessage(
        sendMessageDto.name,
        sendMessageDto.message,
        sendMessageDto.contact_type,
        sendMessageDto.contact_detail,
    );
  }

  // 标记为已读
  @Post('read')
  async readMessage(@Body() messages: number[]) {
    return this.messageService.readMessage(messages);
  }

  // 获取站内信列表 /message/list?page=1&limit=10
  @Get('list')
  async getMessages(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.messageService.getMessages(page, limit);
  }

  // 获取站内信详情
  @Get('detail/:id')
  async getMessageDetail(@Param('id') id: number) {
    return this.messageService.getMessageDetail(id);
  }

  // 删除站内信
  @Delete('delete')
  async deleteMessage(@Body() messages: number[]) {
    return this.messageService.deleteMessage(messages);
  }
}
