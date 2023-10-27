import { Image } from '@/schemas/image.schema';

// 本文件用于从图片数据中提取出所有规格的URL
export default function extractKey(image: Image) {
  const urlList = [{ Key: image.raw }];
  if (image.large) {
    for (const largeImg in image.large) {
      urlList.push({ Key: image.large[largeImg] });
    }
  }
  if (image.medium) {
    for (const mediumImg in image.medium) {
      urlList.push({ Key: image.medium[mediumImg] });
    }
  }
  if (image.small) {
    for (const smallImg in image.small) {
      urlList.push({ Key: image.small[smallImg] });
    }
  }
  return urlList;
}
