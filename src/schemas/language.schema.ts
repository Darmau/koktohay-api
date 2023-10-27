import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Language extends mongoose.Document {
  @Prop({
    required: true,
    index: true,
    unique: true,
  })
  lang: string;

  @Prop()
  locale: string;

  @Prop({
    required: true,
    default: false,
  })
  isDefault: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
