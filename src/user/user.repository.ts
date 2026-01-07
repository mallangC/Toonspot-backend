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

  async findByEmail(email: string) {
    return this.prisma.client.user.findUnique({where: {email}, select: USER_SAFE_SELECT});
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.client.user.findUnique({where: {email}});
  }

  async save(dto: RegisterRequestDto, hashedPassword: string) {
    return this.prisma.client.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: UserRole.USER
      },
      select: USER_SAFE_SELECT
    });
  }

  async update(email: string, nickname: string) {
    return this.prisma.client.user.update({where: {email}, data: {nickname}, select: USER_SAFE_SELECT});
  }

  async delete(email: string) {
    return this.prisma.client.user.delete({where: {email}});
  }
}