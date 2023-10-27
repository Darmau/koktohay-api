import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsIP, IsInt, IsPositive, IsUrl } from 'class-validator';
import mongoose from 'mongoose';
import { CommentType } from '@/enum/comment.enum';

class Interaction {
  @Prop()
  @IsInt()
  @IsPositive()
  upvote: number;

  @Prop()
  @IsInt()
  @IsPositive()
  downvote: number;
}

export class Guest {
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  @IsEmail()
  email: string;

  @Prop()
  @IsUrl()
  website: string;

  @Prop()
  @IsIP()
  ip: string;
}

@Schema()
export class Comment extends mongoose.Document {
  @Prop({
    type: String,
    enum: Object.values(CommentType),
    required: true,
  })
  type: CommentType;

  // 指向所属内容的id
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type',
    required: true,
  })
  belongs_to: mongoose.Types.ObjectId;

  // 是否为匿名评论
  @Prop({
    default: false,
    required: true,
  })
  is_anonymous: boolean;

  // 对于实名评论，user为用户的id
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: function (this: Comment) {
      return !this.is_anonymous;
    },
  })
  user: mongoose.Types.ObjectId;

  // 对于匿名评论，guest为一个包含name、email、website的对象
  @Prop({
    select: function (this: Comment) {
      return this.is_anonymous;
    },
  })
  guest: Guest;

  @Prop({
    required: true,
    default: Date.now,
  })
  publish_date: Date;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  })
  reply_to: mongoose.Types.ObjectId | null;

  @Prop()
  interaction: Interaction;

  @Prop({
    default: true,
    required: true,
  })
  allow_notify: boolean;

  @Prop({
    default: false,
    required: true,
  })
  is_blocked: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
