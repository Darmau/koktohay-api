import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsDateString,
  IsEmail,
  IsIP,
  IsPositive,
  IsUrl,
} from 'class-validator';
import mongoose from 'mongoose';
import { Role } from 'src/enum/role.enum';

@Schema()
export class User extends mongoose.Document {
  @Prop({
    type: String,
    enum: Object.values(Role),
    default: Role.USER,
    required: true,
  })
  role: Role;

  @Prop({
    required: true,
    unique: true,
  })
  username: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  @IsEmail()
  email: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  @IsDateString()
  registration_date: Date;

  @Prop({
    required: true,
    default: Date.now,
  })
  @IsDateString()
  last_login_date: Date;

  @Prop()
  @IsIP()
  last_login_ip: string;

  @Prop({
    default: false,
    required: true,
  })
  subscribed: boolean;

  @Prop()
  @IsUrl()
  website: string;

  @Prop({
    default: false,
    required: true,
  })
  is_blocked: boolean;

  @Prop({
    default: 0,
    required: true,
  })
  @IsPositive()
  comment_count: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
