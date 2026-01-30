import {Injectable} from '@nestjs/common';
import {LikeRepository} from "./like.repository";
import {PostRepository} from "../post/post.repository";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {CommentRepository} from "../comment/comment.repository";
import {LikeResponse} from "./dto/like.response";

@Injectable()
export class LikeService {
  constructor(private readonly likeRepository: LikeRepository,
              private readonly postRepository: PostRepository,
              private readonly commentRepository: CommentRepository) {
  }

  async togglePostLike(userId: number, postId: number): Promise<LikeResponse> {
    await this.checkPost(postId);
    const existsPostLike = await this.likeRepository.existsPostLike(userId, postId);
    if (existsPostLike) {
      await this.likeRepository.deletePostLike(userId, postId)
      await this.postRepository.updateLikeCount(postId, -1)
      return {isLiked: false}
    } else {
      await this.likeRepository.savePostLike(userId, postId)
      await this.postRepository.updateLikeCount(postId, 1)
      return {isLiked: true}
    }
  }

  async toggleCommentLike(userId: number, commentId: number): Promise<LikeResponse> {
    await this.checkComment(commentId);
    const existsPostLike = await this.likeRepository.existsCommentLike(userId, commentId);
    if (existsPostLike) {
      await this.likeRepository.deleteCommentLike(userId, commentId)
      await this.commentRepository.updateLikeCount(commentId, -1)
      return {isLiked: false}
    } else {
      await this.likeRepository.saveCommentLike(userId, commentId)
      await this.commentRepository.updateLikeCount(commentId, 1)
      return {isLiked: true}
    }
  }

  private async checkPost(postId: number) {
    const existsPost = await this.postRepository.existsById(postId);
    if (!existsPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
  }

  private async checkComment(commentId: number) {
    const existsComment = await this.commentRepository.existsById(commentId);
    if (!existsComment) {
      throw new CustomException(ExceptionCode.COMMENT_NOT_FOUND);
    }
  }
}
