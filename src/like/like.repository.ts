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

  async existsCommentLike(userId: number, commentId: number) {
    const existsPostLike = await this.prisma.client.commentLike.findUnique({where: {userId_commentId: {userId, commentId}}});
    return !!existsPostLike;
  }

  async savePostLike(userId: number, postId: number) {
    await this.prisma.client.postLike.create({data: {userId, postId}});
  }

  async saveCommentLike(userId: number, commentId: number) {
    await this.prisma.client.commentLike.create({data: {userId, commentId}});
  }

  async deletePostLike(userId: number, postId: number) {
    await this.prisma.client.postLike.delete({where: {userId_postId: {userId, postId}}})
  }

  async deleteCommentLike(userId: number, commentId: number) {
    await this.prisma.client.commentLike.delete({where: {userId_commentId: {userId, commentId}}})
  }
}