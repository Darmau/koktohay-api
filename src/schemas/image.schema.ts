import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsLatitude, IsLongitude, IsMimeType } from 'class-validator';
import mongoose from 'mongoose';

class ImageFormat {
  @Prop()
  avif: string;

  @Prop()
  webp: string;

  @Prop()
  fallback: string;
}

export class EXIF {
  @Prop()
  maker: string;

  @Prop()
  model: string;

  @Prop()
  exposure_time: number;

  @Prop()
  aperture: number;

  @Prop()
  iso: number;

  @Prop()
  focal_length: number;

  @Prop()
  lens_model: string;
}

export class GPS {
  @Prop()
  @IsLatitude()
  latitude: number;

  @Prop()
  @IsLongitude()
  longitude: number;
}

// Image为图像类型的媒体资源
@Schema()
export class Image extends mongoose.Document {
  @Prop({
    required: true,
    unique: true,
  })
  raw: string;

  @Prop({
    required: true,
  })
  @IsMimeType()
  format: string;

  @Prop()
  alt: string;

  @Prop()
  large: ImageFormat;

  @Prop()
  medium: ImageFormat;

  @Prop()
  small: ImageFormat;

  @Prop()
  exif: EXIF;

  @Prop()
  gps: GPS;

  @Prop()
  location: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  upload_time: Date;

  @Prop()
  shooting_time: Date;

  @Prop({
    required: true,
  })
  size: number;

  @Prop()
  width: number;

  @Prop()
  height: number;

  @Prop()
  hasAlpha: boolean;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
