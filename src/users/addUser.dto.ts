import {IsUUID} from "class-validator";

export class AddUserDto {
  source: string;

  name: string;

  @IsUUID()
  user_id: string;

  role: string;
}
