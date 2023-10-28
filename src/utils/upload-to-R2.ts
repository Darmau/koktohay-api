import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

interface Config {
  S3_REGION: string;
  S3_ENDPOINT: string;
  S3_ACCESS_ID: string;
  S3_SECRET_KEY: string;
  S3_BUCKET: string;
}

export default async function uploadToR2(key: string, file: Buffer, config: Config) {
  const logger = new Logger(uploadToR2.name);

  const s3 = new S3Client({
    region: config.S3_REGION,
    endpoint: config.S3_ENDPOINT,
    credentials: {
      accessKeyId: config.S3_ACCESS_ID,
      secretAccessKey: config.S3_SECRET_KEY,
    },
  });

  const command = new PutObjectCommand({
    Bucket: config.S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: mimetype.get(key.split('.').pop()),
  });
  try {
    await s3.send(command);
    return {
      success: true,
      key: key,
    };
  } catch (error) {
    logger.error(error);
    throw new HttpException(
      'Failed to upload image to R2',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

const mimetype = new Map([
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['webp', 'image/webp'],
  ['avif', 'image/avif'],
  ['svg', 'image/svg+xml'],
  ['gif', 'image/gif'],
  ['mp4', 'video/mp4'],
  ['webm', 'video/webm'],
  ['mp3', 'audio/mpeg'],
  ['wav', 'audio/wav'],
  ['flac', 'audio/flac'],
  ['pdf', 'application/pdf'],
  ['zip', 'application/zip'],
]);
