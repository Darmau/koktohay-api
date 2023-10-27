// 记录网站的相关数据
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Stats extends mongoose.Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  date: Date;

  @Prop()
  new_articles: number;

  @Prop()
  new_photos: number;

  @Prop()
  new_videos: number;

  @Prop()
  new_memos: number;

  @Prop()
  new_comments: number;

  @Prop()
  visitors: number;

  @Prop()
  pageviews: number;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
