import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {CommentService} from "./comment.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "../user/dto/userResponse";
import {CommentDto} from "./dto/comment.dto";
import {CommentUpdateStatusDto} from "./dto/comment.update.status.dto";
import {Roles} from "../decorators/user.roles.decorator";
import {Role} from "../type/user.type";
import {RoleGuard} from "../auth/role.guard";
import {OptionalJwtAuthGuard} from "../auth/jwt/optional.jwt.guard";

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/:postId/comment')
  createComment(@Body() body: CommentDto,
                @Param('postId', ParseIntPipe) postId: number,
                @CurrentUser() user: UserResponse) {
    return this.commentService.createComment(body, postId, user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('post/:postId/comment')
  getComments(@Param('postId', ParseIntPipe) postId: number, @CurrentUser() user: UserResponse | null) {
    return this.commentService.getComments(postId, false, user);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('post/:postId/admin/comment')
  getCommentsForAdmin(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.getComments(postId, true, null);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('comment/:commentId')
  updateComment(@Body() body: CommentDto,
                @Param('commentId', ParseIntPipe) commentId: number,
                @CurrentUser() user: UserResponse) {
    return this.commentService.updateComment(body, commentId, user.id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('comment/:commentId/status')
  updateCommentStatus(@Body() body: CommentUpdateStatusDto,
                      @Param('commentId', ParseIntPipe) commentId: number) {
    return this.commentService.updateStatus(body, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comment/:commentId')
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number,
                 @CurrentUser() user: UserResponse) {
    return this.commentService.deleteComment(commentId, user.id);
  }
}
