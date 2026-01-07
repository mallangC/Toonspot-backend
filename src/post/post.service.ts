import {Injectable} from '@nestjs/common';
import {PostRepository} from "./post.repository";
import {PostCreateDto} from "./dto/post.create.dto";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {PostResponse} from "./dto/post.response";
import {PostUpdateDto} from "./dto/post.update.dto";
import {PostGetPagingDto} from "./dto/post.get.paging.dto";
import {PostStatus} from "@prisma/client";
import {UserRepository} from "../user/user.repository";

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository,
              private readonly userRepository: UserRepository) {
  }

  async createPost(dto: PostCreateDto, userId: number): Promise<PostResponse> {
    return await this.postRepository.save(dto, userId);
  }

  async getUserPosts(dto: PostGetPagingDto, userId: number, isAdmin: boolean) {
    const existsUser = await this.userRepository.existsById(userId);
    if (!existsUser) {
      throw new CustomException(ExceptionCode.USER_NOT_FOUND);
    }
    return await this.postRepository.findAllByUserId(dto, userId, isAdmin);
  }

  async getPost(id: number, isAdmin: boolean): Promise<PostResponse> {
    return await this.findPostById(id, isAdmin);
  }

  getPostsPaged(dto: PostGetPagingDto, isAdmin: boolean) {
    return this.postRepository.findAll(dto, isAdmin);
  }

  async updatePost(id: number, dto: PostUpdateDto, userId: number): Promise<PostResponse> {
    await this.checkPostOwner(id, userId);
    return await this.postRepository.update(id, dto);
  }

  async updateStatus(id: number, status: PostStatus) {
    const existsPost = await this.postRepository.existsById(id);
    if (!existsPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
    return await this.postRepository.updateStatus(id, status);
  }

  async deletePost(id: number, userId: number) {
    await this.checkPostOwner(id, userId);
    await this.postRepository.delete(id);
    return `${id}번 게시물이 삭제되었습니다.`;
  }

  private async findPostById(id: number, isAdmin: boolean) {
    const findPost = await this.postRepository.findById(id, isAdmin);
    if (!findPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
    return findPost;
  }

  private async checkPostOwner(id: number, userId: number) {
    const findPost = await this.findPostById(id, false);
    if (findPost.userId !== userId) {
      throw new CustomException(ExceptionCode.POST_NOT_OWNER);
    }
  }
}
