import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";
import {SupabaseService} from "@/supabase/supabase.service";

@Injectable()
export class AuthService {
  constructor(
      private prisma: PrismaService,
      private readonly supabaseService: SupabaseService,
  ) {}

  // 邮箱注册
  async signup(email: string, password: string) {
    const {data: supabaseData, error} = await this.supabaseService.supabase.auth.signUp({
      email,
      password
    })
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    // 将supabase注册成功返回的信息存入users表
    return this.prisma.public_users.create({
      data: {
        user_id: supabaseData.user.id,
        source: supabaseData.user.app_metadata.provider,
        role: 'reader',
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
