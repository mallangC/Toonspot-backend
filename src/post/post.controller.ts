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

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() body: PostCreateDto, @CurrentUser() user: UserResponse): Promise<PostResponse> {
    return this.postService.createPost(body, user.id);
  }

  @Get()
  getPostsPaged(@Query() dto: PostGetPagingDto) {
    return this.postService.getPostsPaged(dto, false);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getPostsPagedForAdmin(@Query() dto: PostGetPagingDto) {
    return this.postService.getPostsPaged(dto, true);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserPosts(@Query() dto: PostGetPagingDto, @CurrentUser() user: UserResponse) {
    return this.postService.getUserPosts(dto, user.id, false);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin/me')
  getUserPostsForAdmin(@Query() dto: PostGetPagingAdminDto) {
    return this.postService.getUserPosts(dto, dto.userId, true);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getPost(@Param('id', ParseIntPipe) id: number,
                @CurrentUser() user: UserResponse | null,
                @Ip() ip: string) {
    const userIdentifier = user ? user.id.toString() : ip;
    return await this.postService.getPost(id, false, userIdentifier)
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin/:id')
  getPostForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPost(id, true, '')
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updatePost(@Param('id', ParseIntPipe) id: number, @Body() body: PostUpdateDto, @CurrentUser() user: UserResponse) {
    return this.postService.updatePost(id, body, user.id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('status/:id')
  updatePostStatus(@Param('id', ParseIntPipe) id: number, @Body() body: PostUpdateStatusDto) {
    return this.postService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UserResponse) {
    return this.postService.deletePost(id, user.id);
  }
}
