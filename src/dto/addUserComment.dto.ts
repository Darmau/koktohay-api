import { CommentType } from '@/enum/comment.enum';
import mongoose from 'mongoose';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class AddUserCommentDto {
  @IsEnum(CommentType)
  @IsNotEmpty()
  type: CommentType;

  @IsNotEmpty()
  @IsMongoId()
  belongs: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  user: mongoose.Types.ObjectId;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  notify: boolean;

  @IsOptional()
  @IsMongoId()
  reply: mongoose.Types.ObjectId;
}
