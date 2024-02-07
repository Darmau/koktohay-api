import {Body, Controller, Inject, Post} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";
import {AuthService} from "@/auth/auth.service";
import {RegisterDto} from "@/auth/register.dto";

@Controller('auth')
export class AuthController {
  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly authService: AuthService
  ) {}

  // 注册 /auth/signup POST
  @Post('signup')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.signup(
        registerDto.email,
        registerDto.password
    );
  }

  // 登录 /auth/login POST
  @Post('login')
  async login(@Body() registerDto: RegisterDto) {
    return await this.authService.login(
        registerDto.email,
        registerDto.password
    );
  }
}
