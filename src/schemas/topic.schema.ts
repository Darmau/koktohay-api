import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Entry } from './entry.schema';

@Schema()
export class Topic extends mongoose.Document {
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
    unique: true,
  })
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
  })
  cover: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  })
  article: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
  })
  photo: mongoose.Types.ObjectId[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  })
  video: mongoose.Types.ObjectId[];
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
