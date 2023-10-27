import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Entry } from './entry.schema';
import { Image } from './image.schema';

@Schema()
export class Photo extends mongoose.Document {
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
  })
  slug: string;

  @Prop()
  description: string;

  @Prop()
  abstract: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  publish_date: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
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
  cover: Image;

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

  @Prop({
    required: true,
    default: 'unset',
  })
  category: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  })
  gallery: mongoose.Types.ObjectId[];

  @Prop({
    required: true,
    default: false,
  })
  is_draft: boolean;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);
