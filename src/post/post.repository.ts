import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {POST_SELECT} from "../../prisma/prisma.selects";
import {PostStatus} from "@prisma/client";
import {PostCreateDto} from "./dto/post.create.dto";
import {PostResponse} from "./dto/post.response";
import {PostUpdateDto} from "./dto/post.update.dto";
import {PostGetPagingDto} from "./dto/post.get.paging.dto";

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  save(dto: PostCreateDto, userId: number): Promise<PostResponse> {
    return this.prisma.client.post.create({
      data: {...dto, userId},
      select: POST_SELECT
    });
  }

  async existsById(id: number) {
    const existsPost = await this.prisma.client.post.findUnique({
      where: {id},
      select: {id: true}
    });
    return !!existsPost;
  }

  findById(id: number, isAdmin: boolean): Promise<PostResponse | null> {
    const whereClause = {
      id,
      ...(isAdmin ? {} : {status: PostStatus.PUBLISHED})
    };
    return this.prisma.client.post.findUnique({
      where: whereClause,
      select: POST_SELECT
    });
  }

  findAll(dto: PostGetPagingDto, isAdmin: boolean) {
    const {page, keyword} = dto;
    const whereClause = {
      ...(isAdmin ? {} : {status: PostStatus.PUBLISHED}),
      ...(keyword ? {
        OR: [
          {title: {contains: keyword}},
          {content: {contains: keyword}}
        ]
      } : {})
    };
    return this.findAllWithTransaction(page, whereClause);
  }

  findAllByUserId(dto: PostGetPagingDto, userId: number, isAdmin: boolean) {
    const {page, keyword} = dto;
    const whereClause = {
      userId,
      ...(isAdmin ? {} : {status: PostStatus.PUBLISHED}),
      ...(keyword ? {
        OR: [
          {title: {contains: keyword}},
          {content: {contains: keyword}}
        ]
      } : {})
    };
    return this.findAllWithTransaction(page, whereClause);
  }

  update(id: number, dto: PostUpdateDto): Promise<PostResponse> {
    return this.prisma.client.post.update({
      where: {id},
      data: dto,
      select: POST_SELECT
    });
  }

  updateStatus(id: number, status: PostStatus): Promise<PostResponse> {
    return this.prisma.client.post.update({
      where: {id},
      data: {status},
      select: POST_SELECT
    });
  }

  async delete(id: number) {
    await this.prisma.client.post.update({
      where: {id},
      data: {status: PostStatus.DELETED}
    })
  }

  private async findAllWithTransaction(page: number, whereClause: any) {
    const pageSize = 20;
    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.client.post.count({
        where: whereClause
      }),
      this.prisma.client.post.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {id: 'desc'},
        select: POST_SELECT,
      }),
    ]);

    return {
      items,
      metadata: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  }
}