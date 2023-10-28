import {v4 as uuidv4} from 'uuid';
import uploadToR2 from './upload-to-R2';
import {ConfigService} from "@/settings/config/config.service";

class UploadRawImage {
  private readonly date: { format: string; ISO: string };
  private readonly filename: string;
  private readonly image: Buffer;
  private readonly format: string;
  private readonly config;

  constructor(
      file: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
      },
      S3Config
  ) {
    this.image = file.buffer;
    this.date = this.generateDate();
    this.filename = this.generateUUID();
    this.format = file.mimetype.split('/')[1].split('+')[0];
    this.config = S3Config;
  }

  async upload(): Promise<{
    success: boolean;
    folder: string;
    upload_time: string;
    filename: string;
    key: string;
  }> {
    const key = `${this.date.format}/${this.filename}-raw.${this.format}`;
    await uploadToR2(key, this.image, this.config);
    return {
      success: true,
      folder: this.date.format,
      upload_time: this.date.ISO,
      filename: this.filename,
      key: key,
    };
  }

  // 生成日期，作为文件夹名
  private generateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return {
      format: `${year}-${month}-${day}`,
      ISO: date.toISOString(),
    };
  }

  // 生成UUID，作为文件名
  private generateUUID(): string {
    return uuidv4();
  }
}

export default UploadRawImage;
