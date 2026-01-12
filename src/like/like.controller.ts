import {Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {LikeService} from "./like.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "../user/dto/userResponse";

@Controller('like')
export class LikeController {
  constructor(private readonly likeService:LikeService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post('post/:postId')
  togglePostLike(@CurrentUser() user: UserResponse, @Param('postId', ParseIntPipe) postId: number) {
    return this.likeService.togglePostLike(user.id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comment/:commentId')
  toggleCommentLike(@CurrentUser() user: UserResponse, @Param('commentId', ParseIntPipe) commentId: number) {
    return this.likeService.toggleCommentLike(user.id, commentId);
  }
}
