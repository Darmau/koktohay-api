// 本guard负责检测用户的access_token有效性
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {Request} from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    const {data: {user}, error} = await this.supabase.auth.getUser(token);

    if (error) {
      throw new UnauthorizedException('Failed to authenticate user');
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 将user.id信息存入request
    request.user = user.id;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

