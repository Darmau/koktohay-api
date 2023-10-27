import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommentService } from '@/comment/comment.service';
import { PositiveIntPipe } from '@/pipe/positiveInt.pipe';
import { AddUserCommentDto } from '@/dto/addUserComment.dto';
import { AddGuestCommentDto } from '@/dto/addGuestComment.dto';
import mongoose from 'mongoose';

@Controller('comment')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);
  constructor(private readonly commentService: CommentService) {}

  // 获取指定内容的评论
  @Get('latest/:content')
  async getLatestComments(
    @Param('content') content: string,
    @Query('limit', PositiveIntPipe) limit: number = 10,
    @Query('page', PositiveIntPipe) page: number = 1,
  ) {
    return await this.commentService.getCommentsByContent(content, limit, page);
  }

  // 发布登录用户评论 /comment/user-comment POST
  @Post('user-comment')
  async postUserComment(@Body() addUserCommentDto: AddUserCommentDto) {
    return await this.commentService.postComment(
      addUserCommentDto.type,
      addUserCommentDto.belongs,
      addUserCommentDto.user,
      addUserCommentDto.content,
      addUserCommentDto.notify,
      addUserCommentDto.reply,
    );
  }

  // 发布匿名评论
  @Post('guest-comment')
  async postGuestComment(@Body() addGuestCommentDto: AddGuestCommentDto) {
    return await this.commentService.postAnonymousComment(
      addGuestCommentDto.type,
      addGuestCommentDto.belongs,
      addGuestCommentDto.guest,
      addGuestCommentDto.content,
      addGuestCommentDto.reply,
    );
  }

  // 切换封禁状态
  @Patch('block/:id')
  async toggleBlock(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.commentService.switchBlockStatus(id);
  }

  // 删除评论
  @Delete('delete/:id')
  async deleteComment(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.commentService.deleteComment(id);
  }

  // 点赞
  @Patch('upvote/:id')
  async upvote(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.commentService.upvoteComment(id);
  }

  // 点踩
  @Patch('downvote/:id')
  async downvote(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.commentService.downvoteComment(id);
  }
}
