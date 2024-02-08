import {Body, Controller, Inject, Param, Post} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";
import {AuthService} from "@/auth/auth.service";
import {SignupDto} from "@/auth/signup.dto";
import {Provider} from "@supabase/supabase-js";

@Controller('auth')
export class AuthController {
  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly authService: AuthService
  ) {}

  // 注册 /auth/signup POST
  @Post('signup')
  async register(@Body() registerDto: SignupDto) {
    return await this.authService.signup(
        registerDto.email,
        registerDto.password
    );
  }

  // 登录 /auth/login POST
  @Post('login')
  async login(@Body() registerDto: SignupDto) {
    return await this.authService.login(
        registerDto.email,
        registerDto.password
    );
  }

  // 第三方登录 /auth/oauth/github POST
  @Post('oauth/:provider')
  async oauthLogin(@Param('provider') provider: Provider){
    return await this.authService.oauthLogin(
        provider
    );
  }
}
