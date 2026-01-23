import {Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {PostService} from "./post.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {RoleGuard} from "../auth/role.guard";
import {PostCreateDto} from "./dto/post.create.dto";
import {UserResponse} from "../user/dto/userResponse";
import {CurrentUser} from "../decorators/user.decorator";
import {PostResponse} from "./dto/post.response";
import {Roles} from "../decorators/user.roles.decorator";
import {Role} from "../type/user.type";
import {PostGetPagingDto} from "./dto/post.get.paging.dto";
import {PostUpdateStatusDto} from "./dto/post.update.status.dto";
import {PostUpdateDto} from "./dto/post.update.dto";
import {PostGetPagingAdminDto} from "./dto/post.get.paging.admin.dto";
import {OptionalJwtAuthGuard} from "../auth/jwt/optional.jwt.guard";

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post('toon/:toonId/post')
  createPost(@Body() body: PostCreateDto,
             @CurrentUser() user: UserResponse,
             @Param('toonId', ParseIntPipe) toonId: number): Promise<PostResponse> {
    return this.postService.createPost(body, user.id, toonId);
  }

  @Get('toon/:toonId/post')
  getPostsPaged(@Query() dto: PostGetPagingDto,
                @Param('toonId', ParseIntPipe) toonId: number) {
    return this.postService.getPostsPaged(dto, false, toonId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('toon/:toonId/post/admin')
  getPostsPagedForAdmin(@Query() dto: PostGetPagingDto,
                        @Param('toonId', ParseIntPipe) toonId: number) {
    return this.postService.getPostsPaged(dto, true, toonId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('post/me')
  getUserPosts(@Query() dto: PostGetPagingDto, @CurrentUser() user: UserResponse) {
    return this.postService.getUserPosts(dto, user.id, false);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('post/admin/me')
  getUserPostsForAdmin(@Query() dto: PostGetPagingAdminDto) {
    return this.postService.getUserPosts(dto, dto.userId, true);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('post/:postId')
  async getPost(@Param('postId', ParseIntPipe) postId: number,
                @CurrentUser() user: UserResponse | null,
                @Ip() ip: string) {
    const userIdentifier = user ? user.id.toString() : ip;
    return await this.postService.getPost(postId, false, userIdentifier)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('post/admin/:postId')
  getPostForAdmin(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getPost(postId, true, '')
  }

  @UseGuards(JwtAuthGuard)
  @Patch('post/:postId')
  updatePost(@Param('postId', ParseIntPipe) postId: number, @Body() body: PostUpdateDto, @CurrentUser() user: UserResponse) {
    return this.postService.updatePost(postId, body, user.id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('post/:postId/status')
  updatePostStatus(@Param('postId', ParseIntPipe) postId: number, @Body() body: PostUpdateStatusDto) {
    return this.postService.updateStatus(postId, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('post/:postId')
  deletePost(@Param('postId', ParseIntPipe) postId: number, @CurrentUser() user: UserResponse) {
    return this.postService.deletePost(postId, user.id);
  }
}
