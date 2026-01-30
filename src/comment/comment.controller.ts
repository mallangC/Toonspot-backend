import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {CommentService} from "./comment.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "../user/dto/user.response";
import {CommentDto} from "./dto/comment.dto";
import {CommentUpdateStatusDto} from "./dto/comment.update.status.dto";
import {Roles} from "../decorators/user.roles.decorator";
import {Role} from "../type/user.type";
import {RoleGuard} from "../auth/role.guard";
import {OptionalJwtAuthGuard} from "../auth/jwt/optional.jwt.guard";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";
import {CommentResponse} from "./dto/comment.response";

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {
  }

  @ApiOperation({
    summary: '댓글 작성 기능',
    description: '해당 게시판의 댓글을 작성한다. 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: CommentResponse, description: '댓글 작성 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Post('post/:postId/comment')
  createComment(@Body() body: CommentDto,
                @Param('postId', ParseIntPipe) postId: number,
                @CurrentUser() user: UserResponse) {
    return this.commentService.createComment(body, postId, user.id);
  }

  @ApiOperation({
    summary: '댓글 조회 기능',
    description: '해당 게시판의 댓글을 조회한다. 로그인 하지 않은 사용자도 사용이 가능하지만 로그인한 사용자는 댓글에 내가 누른 좋아요를 확인할 수 있다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: CommentResponse, description: '댓글 조회 성공' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get('post/:postId/comment')
  getComments(@Param('postId', ParseIntPipe) postId: number, @CurrentUser() user: UserResponse | null) {
    return this.commentService.getComments(postId, false, user);
  }

  @ApiOperation({
    summary: '(관리자용) 댓글 조회 기능',
    description: '해당 게시판의 댓글을 조회한다. 상태가 BLOCKED, DELETED인 댓글도 함께 조회한다. 관리자로 로그인한 사용자만 접근이 가능하다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: CommentResponse, description: '관리자용 댓글 조회 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('post/:postId/admin/comment')
  getCommentsForAdmin(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.getComments(postId, true, null);
  }

  @ApiOperation({
    summary: '댓글 수정 기능',
    description: '해당 댓글을 수정한다. 로그인한 사용자만 접근 가능하며 내가 작성한 댓글만 수정이 가능하다.'
  })
  @ApiParam({ name: 'commentId', description: '댓글의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: CommentResponse, description: '댓글 수정 성공' })
  @ApiResponse({ status: 400, description: '댓글을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '댓글 수정 권한이 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Patch('comment/:commentId')
  updateComment(@Body() body: CommentDto,
                @Param('commentId', ParseIntPipe) commentId: number,
                @CurrentUser() user: UserResponse) {
    return this.commentService.updateComment(body, commentId, user.id);
  }

  @ApiOperation({
    summary: '댓글 상태 수정 기능',
    description: '해당 댓글의 상태(status)를 수정한다. 관리자로 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'commentId', description: '댓글의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: CommentResponse, description: '댓글 상태 수정 성공' })
  @ApiResponse({ status: 400, description: '댓글을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('comment/:commentId/status')
  updateCommentStatus(@Body() body: CommentUpdateStatusDto,
                      @Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.updateStatus(body, commentId);
  }

  @ApiOperation({
    summary: '댓글 삭제 기능',
    description: '해당 댓글을 삭제 처리한다. Soft Delete 방식으로 처리된다. 로그인한 사용자만 접근 가능하며 내가 작성한 댓글만 삭제가 가능하다.'
  })
  @ApiParam({ name: 'commentId', description: '댓글의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 400, description: '댓글을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Delete('comment/:commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number,
                 @CurrentUser() user: UserResponse) {
    return this.commentService.deleteComment(commentId, user.id);
  }
}
