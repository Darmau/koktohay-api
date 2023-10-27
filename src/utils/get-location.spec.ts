import getLocation from './get-location';

describe('getLocation', () => {
  it('should return the formatted address for a valid location', async () => {
    const longitude = 113.88491111111112;
    const latitude = 22.550883333333335;
    const expectedAddress = '广东省深圳市宝安区新安街道宝华路海滨广场';
    const mockResponse = {
      status: 1,
      regeocode: {
        formatted_address: expectedAddress,
      },
    };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    const result = await getLocation(longitude, latitude);

    expect(result).toEqual(expectedAddress);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://restapi.amap.com/v3/geocode/regeo?key=${
        process.env.AMAP_KEY
      }&location=${longitude.toFixed(6)},${latitude.toFixed(6)}&radius=2000`,
    );
  });

  it('should throw an HttpException for an invalid location', async () => {
    const longitude = 123.456;
    const latitude = 78.901;
    const mockResponse = {
      status: 0,
    };
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    await expect(getLocation(longitude, latitude)).rejects.toThrowError(
      'Failed to get location',
    );
  });
});
