import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IsDateString } from 'class-validator';
import { Entry } from './entry.schema';

@Schema()
export class Article extends mongoose.Document {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    required: true,
  })
  entry: Entry;

  @Prop({
    required: true,
  })
  lang: string;

  @Prop({
    required: true,
    index: true,
  })
  slug: string;

  @Prop()
  description: string;

  // 用于SEO
  @Prop()
  abstract: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  @IsDateString()
  publish_date: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
  @IsDateString()
  update_date: Date;

  @Prop({
    required: true,
    default: false,
  })
  is_featured: boolean;

  @Prop({
    required: true,
    default: false,
  })
  is_top: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
  })
  cover: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    default: 0,
  })
  page_view: number;

  @Prop({
    required: true,
    default: 0,
  })
  comment_count: number;

  @Prop()
  category: string;

  @Prop()
  content: string;

  @Prop({
    required: true,
    default: false,
  })
  is_premium: boolean;

  @Prop({
    required: true,
    default: false,
  })
  is_draft: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
