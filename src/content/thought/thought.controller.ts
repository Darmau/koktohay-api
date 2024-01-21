import {Body, Controller, Delete, Inject, Param, Post, Query} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";
import {ThoughtService} from "@/content/thought/thought.service";
import {AddThoughtDto} from "@/dto/addThought.dto";

@Controller('thought')
export class ThoughtController {
  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly thoughtService: ThoughtService
  ) {
  }

  // 发布想法 /thought/add POST
  @Post('add')
  async postThought(@Body() addThoughtDto: AddThoughtDto) {
    return await this.thoughtService.postThought(
        addThoughtDto.content,
        addThoughtDto.location,
        addThoughtDto.images,
    );
  }

  // 删除想法 /thought/delete/:id?with-img=true DELETE
  @Delete('delete/:id')
  async deleteThought(
      @Param('id') id: number,
      @Query('with-img') withImg: boolean = false
  ) {
    return withImg ?
        await this.thoughtService.deleteThoughtWithImages(id) :
        await this.thoughtService.deleteThoughtWithoutImages(id);
  }

  // 批量获取想法 /thought/latest?page=1&size=10 GET

  // 获取想法详情及附属评论 /thought/detail/:slug

  // 修改想法 /thought/update/:slug PATCH
}
