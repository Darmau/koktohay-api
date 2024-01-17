import uploadToR2 from './upload-to-R2';

class UploadRawImage {
  private readonly date: { day: string; time: string };
  private readonly filename: string;
  private readonly image: Buffer;
  private readonly format: string;
  private readonly config: Record<string, string>;

  constructor(
      file: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
      },
      S3Config: Record<string, string>
  ) {
    this.image = file.buffer;
    this.date = this.generateDate();
    this.filename = file.fieldname;
    this.format = file.mimetype.split('/')[1].split('+')[0];
    this.config = S3Config;
  }

  async upload(): Promise<{
    success: boolean;
    filename: string;
    date: string,
    time: string,
    key: string;
  }> {
    const key = `${this.date.day}/${this.date.time}/${this.filename}.${this.format}`;
    await uploadToR2(key, this.image, this.config);
    return {
      success: true,
      filename: this.filename,
      date: this.date.day,
      time: this.date.time,
      key: key,
    };
  }

  // 根据当前日期，生成2023-12-09，根据时间，生成08-05两种字符串
  private generateDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const miniutes = ('0' + date.getMinutes()).slice(-2);
    return {
      day: `${year}-${month}-${day}`,
      time: `${hours}-${miniutes}`,
    };
  }
}

export default UploadRawImage;
