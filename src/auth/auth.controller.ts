import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "@/auth/auth.service";
import {SignupDto} from "@/auth/signup.dto";

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService
  ) {}

  // 注册 /auth/signup POST
  @Post('signup')
  async register(@Body() registerDto: SignupDto) {
    return await this.authService.signup(
        registerDto.email,
        registerDto.password,
        registerDto.name
    );
  }

  // 登录 /auth/login POST 测试用
  @Post('login')
  async login(@Body() registerDto: SignupDto) {
    return await this.authService.login(
        registerDto.email,
        registerDto.password
    );
  }
}
