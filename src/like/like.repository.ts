import {PrismaService} from "../../prisma/prisma.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async existsPostLike(userId: number, postId: number) {
    const existsPostLike = await this.prisma.client.postLike.findUnique({where: {userId_postId: {userId, postId}}});
    return !!existsPostLike;
  }

  async savePostLike(userId: number, postId: number) {
    await this.prisma.client.postLike.create({data: {userId, postId}});
  }

  async deletePostLike(userId: number, postId: number) {
    await this.prisma.client.postLike.delete({where: {userId_postId: {userId, postId}}})
  }
}