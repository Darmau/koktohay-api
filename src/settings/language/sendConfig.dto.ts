import {IsNotEmpty} from "class-validator";

export class SendConfigDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  value: string;
}
