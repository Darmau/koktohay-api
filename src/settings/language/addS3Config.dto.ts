import { IsString, IsUrl } from 'class-validator';

export class AddS3ConfigDto {
  @IsString()
  S3_REGION: string;

  @IsString()
  @IsUrl()
  S3_ENDPOINT: string;

  @IsString()
  S3_ACCESS_ID: string;

  @IsString()
  S3_SECRET_KEY: string;

  @IsString()
  S3_BUCKET: string;

  @IsString()
  @IsUrl()
  S3_URL_PREFIX: string;
}
