import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";
import {SupabaseService} from "@/supabase/supabase.service";

@Injectable()
export class AuthService {
  constructor(
      private prisma: PrismaService,
      private readonly supabaseService: SupabaseService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  // 邮箱注册
  async signup(email: string, password: string, name: string) {
    // 检查public_users中有多少个用户
    const existUser = await this.prisma.public_users.findMany();

    const {data: supabaseData, error} = await this.supabaseService.supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    this.logger.debug(`${supabaseData.user.email} has been created`);

    // 将supabase注册成功返回的信息存入users表 如果是第一个用户则为admin
    return this.prisma.public_users.create({
      data: {
        user_id: supabaseData.user.id,
        source: supabaseData.user.app_metadata.provider,
        name,
        role: existUser.length === 0 ? 'admin' : 'reader',
      }
    });
  }

  // 邮箱登录
  async login(email: string, password: string) {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    return data;
  }
}
