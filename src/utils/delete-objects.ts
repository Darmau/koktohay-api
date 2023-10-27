import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export default async function deleteObjects(objects: DeleteObject[]) {
  const logger = new Logger(deleteObjects.name);
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_ID,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });
  const command = new DeleteObjectsCommand({
    Bucket: process.env.S3_BUCKET,
    Delete: {
      Objects: objects,
    },
  });
  try {
    const deleteResponse = await s3.send(command);
    return {
      success: true,
      deleteResponse,
    };
  } catch (error) {
    logger.error(`Failed to delete image from R2: ${error}`);
    throw new HttpException(
      'Failed to delete image from R2',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

interface DeleteObject {
  Key: string;
}
