import mongoose from 'mongoose';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  slug: string;

  @IsOptional()
  cover: mongoose.Types.ObjectId;
}
