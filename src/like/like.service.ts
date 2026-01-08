import {Injectable} from '@nestjs/common';
import {LikeRepository} from "./like.repository";
import {PostRepository} from "../post/post.repository";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository,
              private readonly postRepository: PostRepository,) {
  }

  async togglePostLike(userId: number, postId: number) {
    await this.checkPost(postId);
    const existsPostLike = await this.likeRepository.existsPostLike(userId, postId);
    if (existsPostLike) {
      await this.likeRepository.deletePostLike(userId, postId)
      await this.postRepository.updateLikeCount(postId, -1)
      return {liked: false}
    } else {
      await this.likeRepository.savePostLike(userId, postId)
      await this.postRepository.updateLikeCount(postId, 1)
      return {liked: true}
    }
  }

  async getPostLikes(userId: number, postId: number) {
    await this.checkPost(postId);
    return await this.likeRepository.existsPostLike(userId, postId);
  }

  private async checkPost(postId: number) {
    const existsPost = await this.postRepository.existsById(postId);
    if (!existsPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
  }
}
