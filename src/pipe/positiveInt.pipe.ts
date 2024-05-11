import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform {
  transform(value: number, metadata: ArgumentMetadata): number {
    if (metadata.type === 'query') {
      if (metadata.data === 'limit' && value < 1) {
        return 10;
      }
      if (metadata.data === 'page' && value < 1) {
        return 1;
      }
    }
    return value;
  }
}
