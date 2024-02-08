import {Injectable} from '@nestjs/common';
import {PrismaService} from "@/prisma/prisma.service";

@Injectable()
export class UsersService {

  constructor(
      private prisma: PrismaService,
  ) {
  }

  // 检测是否存在管理员账户
  async checkAdmin(): Promise<Boolean> {
    const admin = await this.prisma.public_users.findFirst({
      where: {
        role: 'admin'
      }
    });
    return admin !== null;
  }

  // 在public_users创建对应信息
  async createUser(name: string, source: string, user_id: string) {
    // 检测是否已存在管理员
    const admin = await this.checkAdmin();
    return this.prisma.public_users.create({
      data: {
        name: name,
        source: source,
        user_id: user_id,
        role: admin ? 'reader' : 'admin'
      }
    });
  }

  // 根据user_id查找，看是否为admin
  async ifAdmin(user_id: string): Promise<boolean> {
    const user = await this.prisma.public_users.findFirst({
      where: {
        user_id: user_id
      }
    });
    return user?.role === 'admin';
  }

  // 封禁用户
  async banUser(id: number) {
    return this.prisma.public_users.update({
      where: {
        id: id
      },
      data: {
        role: 'banned'
      }
    });
  }
}
