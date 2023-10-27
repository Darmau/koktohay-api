import { MemoInfo } from '@/interface/memo';
import { ImageService } from '@/media/image/image.service';
import { Memo } from '@/schemas/memo.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import getCurrentTimeFormatted from '@/utils/generateDateSlug';

@Injectable()
export class MemoService {
  constructor(
    @InjectModel('Memo') private memoModel: Model<Memo>,
    private readonly imageService: ImageService,
  ) {}

  private async generateMediumImageList(images: Memo['images']) {
    const imageList = [];
    if (images.length > 0) {
      for (const image of images) {
        imageList.push(
          await this.imageService
            .getImageUrl(image.toString())
            .then((image) => {
              return image.medium;
            }),
        );
      }
    }
    return imageList;
  }

  // 发布memo
  async postMemo(content: string, images?: string[]): Promise<Memo> {
    const newMemo = new this.memoModel({
      slug: getCurrentTimeFormatted(),
      content: content,
      images: images || null,
      publish_date: Date.now(),
      comment_count: 0,
    });
    await newMemo.save();
    return newMemo;
  }

  // 获取memo的信息
  async getMemoById(id: string): Promise<MemoInfo> {
    const memoData = await this.memoModel.findById(id).exec();
    if (!memoData) {
      throw new HttpException('Memo not found', HttpStatus.NOT_FOUND);
    }
    const memoImages = await this.generateMediumImageList(memoData.images);

    return {
      slug: memoData.slug,
      publish_date: memoData.publish_date,
      comment_count: memoData.comment_count,
      content: memoData.content,
      images: memoImages,
    };
  }

  // 根据slug获取memo的信息
  async getMemoBySlug(slug: string): Promise<MemoInfo> {
    const memoData = await this.memoModel.findOne({ slug: slug }).exec();
    if (!memoData) {
      throw new HttpException('Memo not found', HttpStatus.NOT_FOUND);
    }
    const memoImages = await this.generateMediumImageList(memoData.images);
    return {
      slug: memoData.slug,
      publish_date: memoData.publish_date,
      comment_count: memoData.comment_count,
      content: memoData.content,
      images: memoImages,
    };
  }

  // 批量获取memo信息
  async getMemos(limit: number, page: number): Promise<MemoInfo[]> {
    const memosData = await this.memoModel
      .find()
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    const memos = [];
    for (const memoData of memosData) {
      const memoImages = [];
      if (memoData.images) {
        for (const image of memoData.images) {
          memoImages.push(
            await this.imageService
              .getImageUrl(image.toString())
              .then((image) => {
                return image.small;
              }),
          );
        }
      }
      memos.push({
        slug: memoData.slug,
        publish_date: memoData.publish_date,
        comment_count: memoData.comment_count,
        content: memoData.content,
        images: memoImages,
      });
    }
    return memos;
  }

  // 删除memo
  async deleteMemo(id: string): Promise<Memo> {
    const deletedMemo = await this.memoModel.findByIdAndDelete(id);
    if (!deletedMemo) {
      throw new HttpException('Memo not found', HttpStatus.NOT_FOUND);
    }
    return deletedMemo;
  }

  // 修改memo
  async updateMemo(id: string, body: Partial<Memo>): Promise<Memo> {
    const memo = this.memoModel.findByIdAndUpdate(id, body);
    if (!memo) {
      throw new HttpException('Memo not found', HttpStatus.NOT_FOUND);
    }
    return memo;
  }
}
