import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {CommentDto} from "./dto/comment.dto";
import {COMMENT_SELECT} from "../../prisma/prisma.selects";
import {CommentStatus} from "@prisma/client";
import {CommentUpdateStatusDto} from "./dto/comment.update.status.dto";
import {CommentResponse} from "./dto/comment.response";

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  save(dto: CommentDto, postId: number, userId: number): Promise<CommentResponse> {
    return this.prisma.client.comment.create({data: {...dto, postId, userId}, select: COMMENT_SELECT});
  }

  async existsById(id: number) {
    const existsComment = await this.prisma.client.comment.findUnique({where: {id}, select: {id: true}});
    return !!existsComment;
  }

  findById(id: number): Promise<CommentResponse | null> {
    return this.prisma.client.comment.findUnique({
      where: {id, status: CommentStatus.PUBLISHED},
      select: COMMENT_SELECT
    });
  }

  findAllByPostId(postId: number, isAdmin: boolean, userId?: number): Promise<CommentResponse[]> {
    const whereClause = {
      postId,
      ...(isAdmin ? {} : {status: CommentStatus.PUBLISHED})
    };
    return this.prisma.client.comment.findMany({
      where: whereClause,
      orderBy: {createdAt: 'asc'},
      select: {
        ...COMMENT_SELECT,
        likes: userId ? {
          where: {userId: userId},
          take: 1,
          select: {userId: true}
        } : false,
      }
    });
  }

  update(dto: CommentDto, id: number): Promise<CommentResponse> {
    return this.prisma.client.comment.update({where: {id}, data: dto, select: COMMENT_SELECT});
  }

  updateStatus(dto: CommentUpdateStatusDto, id: number): Promise<CommentResponse> {
    return this.prisma.client.comment.update({where: {id}, data: dto, select: COMMENT_SELECT});
  }

  updateLikeCount(id: number, num: number): Promise<CommentResponse> {
    return this.prisma.client.comment.update({where: {id}, data: {likeCount: {increment: num}}})
  }

  async delete(id: number) {
    await this.prisma.client.comment.update({where: {id}, data: {status: CommentStatus.DELETED}})
  }
}