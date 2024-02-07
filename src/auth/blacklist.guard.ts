// 本guard负责检测用户的role是否在黑名单中
import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class BlacklistGuard implements CanActivate {
  constructor(
      private prisma: PrismaService,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new ForbiddenException('No user id provided');
    }
    // 提取request.user, 去数据库查询该user，检查role是否为admin
    const userData = await this.prisma.public_users.findUnique({
      where: {
        user_id: request.user
      },
      select: {
        role: true
      }
    });
    // 若不是reader或admin，则抛出ForbiddenException
    if (userData.role === 'banned') {
      throw new ForbiddenException('User is banned');
    }
    return true;
  }
}

