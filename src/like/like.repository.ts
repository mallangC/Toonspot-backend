import {PrismaService} from "../../prisma/prisma.service";
import {Injectable} from "@nestjs/common";
import {POST_LIKE_SELECT} from "../../prisma/prisma.selects";

@Injectable()
export class LikeRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async existsPostLike(userId: number, postId: number) {
    const existsPostLike = await this.prisma.client.postLike.findUnique({where: {userId_postId: {userId, postId}}});
    return !!existsPostLike;
  }

  savePostLike(userId: number, postId: number) {
    return this.prisma.client.postLike.create({data: {userId, postId}, select: POST_LIKE_SELECT});
  }

  async deletePostLike(userId: number, postId: number) {
    await this.prisma.client.postLike.delete({where: {userId_postId: {userId, postId}}})
  }
}