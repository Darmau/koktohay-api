// 用于从图片原始链接中提取出文件夹和文件名
export default function extractFolderName(image) {
  return {
    folder: `${image.date}/${image.time}`,
    fileName: `${image.file_name}`,
  };
}
