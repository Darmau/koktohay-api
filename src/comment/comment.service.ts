import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, Guest } from '@/schemas/comment.schema';
import mongoose, { Model } from 'mongoose';
import { CommentType } from '@/enum/comment.enum';

@Injectable()
export class CommentService {
  constructor(@InjectModel('Comment') private commentModel: Model<Comment>) {}

  // 根据内容获取评论
  async getCommentsByContent(
    content: string,
    limit: number,
    page: number,
  ): Promise<Comment[]> {
    const comments = await this.commentModel
      .find({ belongs_to: content })
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ publish_date: -1 })
      .exec();
    if (comments.length === 0) {
      throw new HttpException('No comment found', HttpStatus.NOT_FOUND);
    }
    return comments;
  }

  // 发布评论
  async postComment(
    type: CommentType,
    belongs: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    content: string,
    notify: boolean,
    reply?: mongoose.Types.ObjectId,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      type: type,
      belongs_to: belongs,
      user: user,
      content: content,
      reply_to: reply || null,
      allow_notify: notify,
      is_anonymous: false,
      publish_date: Date.now(),
      is_blocked: false,
      interaction: {
        upvote: 0,
        downvote: 0,
      },
    });
    try {
      await newComment.save();
      return newComment;
    } catch (e) {
      throw new HttpException(
        'Failed to post comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 发布匿名评论
  async postAnonymousComment(
    type: CommentType,
    belongs: mongoose.Types.ObjectId,
    guest: Guest,
    content: string,
    reply?: mongoose.Types.ObjectId,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      type: type,
      belongs_to: belongs,
      guest: guest,
      content: content,
      reply_to: reply || null,
      allow_notify: false,
      is_anonymous: true,
      publish_date: Date.now(),
      is_blocked: true,
      interaction: {
        upvote: 0,
        downvote: 0,
      },
    });
    try {
      await newComment.save();
      return newComment;
    } catch (e) {
      throw new HttpException(
        'Failed to post comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 切换评论封禁状态
  async switchBlockStatus(id: mongoose.Types.ObjectId): Promise<string> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
    try {
      await this.commentModel.findByIdAndUpdate(id, {
        is_blocked: !comment.is_blocked,
      });
      return `Switch comment to ${
        !comment.is_blocked ? 'block' : 'unblock'
      } successfully`;
    } catch (e) {
      throw new HttpException(
        'Failed to switch comment block status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 删除评论
  async deleteComment(id: mongoose.Types.ObjectId): Promise<string> {
    try {
      await this.commentModel.findByIdAndDelete(id);
      return 'Delete comment successfully';
    } catch (e) {
      throw new HttpException(
        'Failed to delete comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 点赞评论
  async upvoteComment(id: mongoose.Types.ObjectId): Promise<string> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new HttpException('Comment is not exist', HttpStatus.NOT_FOUND);
    }
    try {
      await this.commentModel.findByIdAndUpdate(id, {
        interaction: {
          upvote: comment.interaction.upvote + 1,
        },
      });
      return 'Upvote comment successfully';
    } catch (e) {
      throw new HttpException(
        'Failed to upvote comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 反对评论
  async downvoteComment(id: mongoose.Types.ObjectId): Promise<string> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new HttpException('Comment is not exist', HttpStatus.NOT_FOUND);
    }
    try {
      await this.commentModel.findByIdAndUpdate(id, {
        interaction: {
          downvote: comment.interaction.downvote + 1,
        },
      });
      return 'Downvote comment successfully';
    } catch (e) {
      throw new HttpException(
        'Failed to upvote comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
