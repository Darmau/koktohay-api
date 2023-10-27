import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { EntryType } from '@/enum/entry.enum';

@Schema()
export class Category extends mongoose.Document {
  @Prop({
    type: String,
    enum: Object.values(EntryType),
    required: true,
  })
  type: EntryType;

  @Prop({
    required: true,
    index: true,
  })
  slug: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
  })
  cover: mongoose.Schema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
