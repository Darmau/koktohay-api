import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MemoService } from './memo.service';
import { Memo } from '@/schemas/memo.schema';

@Controller('memo')
export class MemoController {
  private readonly logger = new Logger(MemoController.name);
  constructor(private readonly memoService: MemoService) {}

  // 发布memo /memo/post POST
  @Post('post')
  async postMemo(@Body() body: { content: string; images?: string[] }) {
    this.logger.debug(`post memo: ${JSON.stringify(body)}`);
    return await this.memoService.postMemo(body.content, body.images);
  }

  // 获取memo /memo/get/:id GET
  @Get('get/id/:id')
  async getMemoById(@Param('id') id: string) {
    return await this.memoService.getMemoById(id);
  }

  // 根据slug获取 /memo/get/slug/:slug GET
  @Get('get/slug/:slug')
  async getMemoBySlug(@Param('slug') slug: string) {
    return await this.memoService.getMemoBySlug(slug);
  }

  // 批量获取memo /memo/latest?limit=10&page=1 GET
  @Get('latest')
  async getMemos(
    @Query('limit') limit: number = 15,
    @Query('page') page: number = 1,
  ) {
    return await this.memoService.getMemos(limit, page);
  }

  // 删除memo /memo/delete/:id DELETE
  @Delete('delete/:id')
  async deleteMemo(@Param('id') id: string) {
    return await this.memoService.deleteMemo(id);
  }

  // 修改memo /memo/update/:id PATCH
  @Patch('update/:id')
  async updateMemo(@Param('id') id: string, @Body() body: Partial<Memo>) {
    return await this.memoService.updateMemo(id, body);
  }
}
