export interface MemoInfo {
  slug: string;
  publish_date: Date;
  comment_count: number;
  content: string;
  images: {
    jpeg?: string;
    png?: string;
    webp: string;
    avif: string;
  }[];
}
