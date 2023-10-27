import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDateString } from 'class-validator';
import mongoose from 'mongoose';

@Schema()
export class Memo extends mongoose.Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  slug: string;

  @Prop({
    default: Date.now,
    required: true,
  })
  @IsDateString()
  publish_date: Date;

  @Prop({
    required: true,
    default: 0,
  })
  comment_count: number;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  })
  images: mongoose.Types.ObjectId[];
}

export const MemoSchema = SchemaFactory.createForClass(Memo);
