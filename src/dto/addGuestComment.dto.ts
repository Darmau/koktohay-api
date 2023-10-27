import { CommentType } from '@/enum/comment.enum';
import mongoose from 'mongoose';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Guest } from '@/schemas/comment.schema';

export class AddGuestCommentDto {
  @IsEnum(CommentType)
  @IsNotEmpty()
  type: CommentType;

  @IsNotEmpty()
  @IsMongoId()
  belongs: mongoose.Types.ObjectId;

  @IsNotEmpty()
  guest: Guest;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsMongoId()
  reply: mongoose.Types.ObjectId;
}
