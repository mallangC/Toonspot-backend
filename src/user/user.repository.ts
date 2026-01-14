import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {USER_SAFE_SELECT} from "../../prisma/prisma.selects";
import {UserRegisterDto} from "./dto/user.register.dto";
import {UserRole, UserStatus} from "@prisma/client";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async existsByEmail(email: string) {
    const existsUser = await this.prisma.client.user.findFirst({where: {email}, select: {id: true}});
    return !!existsUser;
  }

  async existsByNickname(nickname: string) {
    const existsUser = await this.prisma.client.user.findFirst({where: {nickname}, select: {id: true}});
    return !!existsUser;
  }

  async existsById(id: number) {
    const existsUser = await this.prisma.client.user.findUnique({where: {id}, select: {id: true}});
    return !!existsUser;
  }

  async existsByToken(token: string) {
    const existsUser = await this.prisma.client.user.findFirst({where: {verificationToken: token}, select: {id: true}});
    return !!existsUser;
  }

  findById(id: number) {
    return this.prisma.client.user.findUnique({where: {id}, select: USER_SAFE_SELECT});
  }

  findByEmail(email: string) {
    return this.prisma.client.user.findUnique({where: {email}, select: USER_SAFE_SELECT});
  }

  findByEmailWithPassword(email: string) {
    return this.prisma.client.user.findUnique({where: {email}});
  }

  save(dto: UserRegisterDto, hashedPassword: string, verificationToken: string) {
    return this.prisma.client.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        verificationToken,
        role: UserRole.USER
      },
      select: USER_SAFE_SELECT
    });
  }

  async updateVerify(verificationToken: string) {
    await this.prisma.client.user.update({where: {verificationToken}, data: {status: UserStatus.ACTIVE}});
  }

  updateNickname(email: string, nickname: string) {
    return this.prisma.client.user.update({where: {email}, data: {nickname}, select: USER_SAFE_SELECT});
  }

  updateStatus(id: number, status: UserStatus) {
    return this.prisma.client.user.update({where: {id}, data: {status}, select: USER_SAFE_SELECT});
  }

  delete(email: string) {
    return this.prisma.client.user.update({where: {email}, data: {status: UserStatus.DELETED}});
  }
}