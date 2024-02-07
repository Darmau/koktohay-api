import {IsString, MaxLength} from "class-validator";

export class SendMessageDto {
  @IsString()
  @MaxLength(32)
  name: string;

  @MaxLength(640)
  @IsString()
  message: string;

  @IsString()
  contact_type: ContactType;

  @IsString()
  @MaxLength(128)
  contact_detail: string;
}

// 定义一个enum
export enum ContactType {
  email = 'email',
  wechat = 'wechat',
  telegram = 'telegram',
  twitter = 'twitter',
  line = 'line',
  whatsapp = 'whatsapp',
}
