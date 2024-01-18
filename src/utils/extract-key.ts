// 本文件用于从图片数据中提取出所有规格的URL
export default function extractKey(image) {
  const urlList = [{
    Key: `${image.date}/${image.time}/${image.file_name}.${image.format}`
  }];
  if (image.large) {
    urlList.push({
      Key: `${image.date}/${image.time}/${image.file_name}-large.${image.format}`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-large.avif`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-large.webp`
    })
  }
  if (image.medium) {
    urlList.push({
      Key: `${image.date}/${image.time}/${image.file_name}-medium.${image.format}`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-medium.avif`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-medium.webp`
    })
  }
  if (image.small) {
    urlList.push({
      Key: `${image.date}/${image.time}/${image.file_name}-small.${image.format}`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-small.avif`
    }, {
      Key: `${image.date}/${image.time}/${image.file_name}-small.webp`
    })
  }
  return urlList;
}
