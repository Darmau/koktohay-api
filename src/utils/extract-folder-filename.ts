// 用于从图片原始链接中提取出文件夹和文件名
export default function extractFolderName(url: string) {
  const segments = url.split('/');
  const folder = segments[0];
  const fileNameArr = segments[1].split('-');
  fileNameArr.pop();
  const fileName = fileNameArr.join('-');
  return {
    folder,
    fileName,
  };
}
