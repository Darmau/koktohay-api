import mongoose from 'mongoose';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  title: string;

  @IsOptional()
  description: string;

  @IsOptional()
  abstract: string;

  @IsOptional()
  is_featured: boolean;

  @IsOptional()
  is_top: boolean;

  @IsOptional()
  @IsMongoId()
  cover: mongoose.Types.ObjectId;

  @IsOptional()
  category: string;

  @IsOptional()
  @IsMongoId()
  gallery: mongoose.Types.ObjectId[];
}
