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
    const existsPost = await this.postRepository.existsById(postId);
    if (!existsPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
    const existsPostLike = await this.likeRepository.existsPostLike(userId, postId);
    if (existsPostLike) {
      await this.likeRepository.deletePostLike(userId, postId)
      return `${postId}번 게시물에 좋아요를 취소했습니다.`
    }else {
      return await this.likeRepository.savePostLike(userId, postId);
    }
  }
  
}
