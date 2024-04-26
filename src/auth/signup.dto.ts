import {IsEmail, IsString, Length, MinLength} from "class-validator";

export class SignupDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @Length(2, 12)
    name: string;
}
