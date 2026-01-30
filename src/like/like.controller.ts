import {Controller, Param, ParseIntPipe, Post, UseGuards} from '@nestjs/common';
import {LikeService} from "./like.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "../user/dto/user.response";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";
import {LikeResponse} from "./dto/like.response";

@Controller()
export class LikeController {
  constructor(private readonly likeService:LikeService) {
  }

  @ApiOperation({
    summary: '게시물 좋아요/좋아요 취소 기능',
    description: '해당 게시물에 좋아요를 추가 또는 제거한다. 로그인한 사용자만 접근 가능하며, 게시물의 LikeCount가 업데이트 된다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: LikeResponse, description: '게시물 좋아요/좋아요 취소 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Post('post/:postId/like')
  togglePostLike(@CurrentUser() user: UserResponse, @Param('postId', ParseIntPipe) postId: number) {
    return this.likeService.togglePostLike(user.id, postId);
  }

  @ApiOperation({
    summary: '댓글 좋아요/좋아요 취소 기능',
    description: '해당 댓글에 좋아요를 추가 또는 제거한다. 로그인한 사용자만 접근 가능하며, 댓글의 LikeCount가 업데이트 된다.'
  })
  @ApiParam({ name: 'commentId', description: '댓글의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: LikeResponse, description: '댓글 좋아요/좋아요 취소 성공' })
  @ApiResponse({ status: 400, description: '댓글을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Post('comment/:commentId/like')
  toggleCommentLike(@CurrentUser() user: UserResponse, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.likeService.toggleCommentLike(user.id, commentId);
  }
}
