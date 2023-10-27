import extractFolderName from './extract-folder-filename';

describe('extractFolderName', () => {
  it('should extract folder and file name from url', () => {
    const url = '2023-08-03/f8be5582-428e-4d1f-9d5b-603721dc52d1-raw.jpeg';
    const expected = {
      folderName: '2023-08-03',
      fileName: 'f8be5582-428e-4d1f-9d5b-603721dc52d1',
    };
    const result = extractFolderName(url);
    expect(result).toEqual(expected);
  });

  it('should extract folder and file name from url with different folder name', () => {
    const url = '2023-08-03/f8be5582-428e-4d1f-9d5b-603721dc52d1-large.jpeg';
    const expected = {
      folderName: '2023-08-03',
      fileName: 'f8be5582-428e-4d1f-9d5b-603721dc52d1',
    };
    const result = extractFolderName(url);
    expect(result).toEqual(expected);
  });

  it('should extract folder and file name from url with different file name', () => {
    const url = '2023-08-03/e33cdb71-eebd-4a1e-856d-5a31ca2152fb-medium.webp';
    const expected = {
      folderName: '2023-08-03',
      fileName: 'e33cdb71-eebd-4a1e-856d-5a31ca2152fb',
    };
    const result = extractFolderName(url);
    expect(result).toEqual(expected);
  });
});
