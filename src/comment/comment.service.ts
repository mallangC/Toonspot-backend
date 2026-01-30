import {Injectable} from '@nestjs/common';
import {CommentRepository} from "./comment.repository";
import {CommentDto} from "./dto/comment.dto";
import {PostRepository} from "../post/post.repository";
import {CommentUpdateStatusDto} from "./dto/comment.update.status.dto";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {CommentResponse} from "./dto/comment.response";
import {UserResponse} from "../user/dto/user.response";

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository,
              private readonly postRepository: PostRepository) {
  }

  //등록
  async createComment(dto: CommentDto, postId: number, userId: number): Promise<CommentResponse> {
    await this.checkPost(postId);
    return await this.commentRepository.save(dto, postId, userId);
  }

  // postId로 전체 조회
  async getComments(postId: number, isAdmin: boolean, user: UserResponse | null): Promise<CommentResponse[]> {
    const findComments = await this.commentRepository.findAllByPostId(postId, isAdmin, user?.id);
    return findComments.map(({likes, ...comment}) => {
      return {
        ...comment,
        isLiked: !!(user && likes && likes.length > 0)
      }
    });
  }

  // 수정
  async updateComment(dto: CommentDto, commentId: number, userId: number): Promise<CommentResponse> {
    await this.checkCommentOwner(commentId, userId);
    return await this.commentRepository.update(dto, commentId);
  }

  async updateStatus(dto: CommentUpdateStatusDto, commentId: number): Promise<CommentResponse> {
    await this.existsCommentById(commentId);
    return await this.commentRepository.updateStatus(dto, commentId);
  }

  // 삭제 (soft delete)
  async deleteComment(commentId: number, userId: number) {
    await this.checkCommentOwner(commentId, userId);
    await this.commentRepository.delete(commentId);
    return `${commentId}번 댓글이 삭제되었습니다.`;
  }

  private async existsCommentById(commentId: number) {
    const findComment = await this.commentRepository.findById(commentId);
    if (!findComment) {
      throw new CustomException(ExceptionCode.COMMENT_NOT_FOUND);
    }
    return findComment;
  }

  private async checkCommentOwner(commentId: number, userId: number) {
    const findComment = await this.existsCommentById(commentId);
    if (findComment.userId !== userId) {
      throw new CustomException(ExceptionCode.COMMENT_NOT_OWNER);
    }
  }

  private async checkPost(postId: number) {
    const existsPost = await this.postRepository.existsById(postId);
    if (!existsPost) {
      throw new CustomException(ExceptionCode.POST_NOT_FOUND);
    }
  }
}

