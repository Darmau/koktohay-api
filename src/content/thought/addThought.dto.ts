import {IsArray, IsString} from "class-validator";

export class AddThoughtDto {
  @IsString()
  content: string;

  @IsString()
  location?: string;

  @IsArray()
  images?: number[];
}
