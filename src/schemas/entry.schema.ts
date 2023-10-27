import { EntryType } from '@/enum/entry.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Entry extends mongoose.Document {
  @Prop({
    required: true,
    index: true,
  })
  slug: string;

  @Prop({
    type: String,
    enum: Object.values(EntryType),
    required: true,
  })
  type: EntryType;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  versions: any;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
