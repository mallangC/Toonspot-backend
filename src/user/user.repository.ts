import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {USER_SAFE_SELECT} from "../../prisma/prisma.selects";
import {RegisterRequestDto} from "./dto/register.request.dto";
import {UserRole} from "@prisma/client";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async existsByEmail(email: string) {
    return await this.prisma.user.count({where: {email}}) > 0;
  }

  async existsByNickname(nickname: string) {
    return await this.prisma.user.count({where: {nickname}}) > 0;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({where: {email}, select: USER_SAFE_SELECT});
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({where: {email}});
  }

  async save(dto: RegisterRequestDto, hashedPassword: string) {
    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: UserRole.USER
      },
      select: USER_SAFE_SELECT
    });
  }

  async update(email: string, nickname: string) {
    return this.prisma.user.update({where: {email}, data: {nickname}, select: USER_SAFE_SELECT});
  }

  async delete(email: string) {
    return this.prisma.user.delete({where: {email}});
  }
}