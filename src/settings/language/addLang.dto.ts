import { IsLocale, IsNotEmpty } from 'class-validator';

export class AddLangDto {
  @IsNotEmpty()
  @IsLocale()
  lang: string;

  @IsNotEmpty()
  locale: string;
}
