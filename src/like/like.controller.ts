import {Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards} from '@nestjs/common';
import {LikeService} from "./like.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponseDto} from "../user/dto/user.response.dto";

@Controller('like')
export class LikeController {
  constructor(private readonly likeService:LikeService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  togglePostLike(@CurrentUser() user: UserResponseDto, @Param('postId', ParseIntPipe) postId: number) {
    return this.likeService.togglePostLike(user.id, postId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':postId')
  GetPostLike(@CurrentUser() user: UserResponseDto, @Param('postId', ParseIntPipe) postId: number) {
    return this.likeService.getPostLikes(user.id, postId);
  }
}
