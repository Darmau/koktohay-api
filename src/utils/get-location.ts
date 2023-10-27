import { HttpException, HttpStatus } from '@nestjs/common';

export default async function getLocation(
  key: string,
  longitude: number,
  latitude: number,
) {
  const response = await fetch(
    `https://restapi.amap.com/v3/geocode/regeo?key=${
      key
    }&location=${longitude.toFixed(6)},${latitude.toFixed(6)}&radius=2000`,
  );

  const regeocode = await response.json();

  if (regeocode.status === 0) {
    throw new HttpException(
      'Failed to get location',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  return regeocode.regeocode.formatted_address;
}
