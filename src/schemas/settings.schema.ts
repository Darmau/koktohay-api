import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Settings extends mongoose.Document {
  @Prop({
    required: true,
    index: true,
    unique: true,
  })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  config: any;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
