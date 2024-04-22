import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {PrismaModule} from "@/prisma/prisma.module";
import {SupabaseModule} from "@/supabase/supabase.module";

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
