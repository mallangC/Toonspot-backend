import {Body, Controller, Delete, Get, Ip, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {PostService} from "./post.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {RoleGuard} from "../auth/role.guard";
import {PostCreateDto} from "./dto/post.create.dto";
import {UserResponse} from "../user/dto/user.response";
import {CurrentUser} from "../decorators/user.decorator";
import {PostResponse} from "./dto/post.response";
import {Roles} from "../decorators/user.roles.decorator";
import {Role} from "../type/user.type";
import {PostGetPagingDto} from "./dto/post.get.paging.dto";
import {PostUpdateStatusDto} from "./dto/post.update.status.dto";
import {PostUpdateDto} from "./dto/post.update.dto";
import {PostGetPagingAdminDto} from "./dto/post.get.paging.admin.dto";
import {OptionalJwtAuthGuard} from "../auth/jwt/optional.jwt.guard";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {
  }
  
  @ApiOperation({
    summary: '게시물 등록 기능',
    description: '게시물을 등록 후 반환한다. 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'toonId', description: '웹툰의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '게시물 등록 성공' })
  @ApiResponse({ status: 400, description: '웹툰을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Post('toon/:toonId/post')
  createPost(@Body() body: PostCreateDto,
             @CurrentUser() user: UserResponse,
             @Param('toonId', ParseIntPipe) toonId: number): Promise<PostResponse> {
    return this.postService.createPost(body, user.id, toonId);
  }

  @ApiOperation({
    summary: '게시물 전체 조회 기능',
    description: 'ACTIVE 상태인 해당 웹툰 게시판의 전체 게시물을 조회한다. 페이징 처리를 위한 page 파라미터가 필수이며 키워드 검색을 사용할 수 있다.'
  })
  @ApiParam({ name: 'toonId', description: '웹툰의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '게시물 전체 조회 성공' })
  @ApiResponse({ status: 400, description: '웹툰을 찾을 수 없음' })
  @Get('toon/:toonId/post')
  getPostsPaged(@Query() dto: PostGetPagingDto,
                @Param('toonId', ParseIntPipe) toonId: number) {
    return this.postService.getPostsPaged(dto, false, toonId);
  }


  @ApiOperation({
    summary: '(관리자용) 게시물 전체 조회 기능',
    description: '모든 상태의 해당 웹툰 게시판의 전체 게시물을 조회한다. 페이징 처리를 위한 page 파라미터가 필수이며 키워드 검색을 사용할 수 있다. 관리자로 로그인한 사용자만 접근이 가능하다.'
  })
  @ApiParam({ name: 'toonId', description: '웹툰의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '게시물 전체 조회 성공' })
  @ApiResponse({ status: 400, description: '웹툰을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('toon/:toonId/post/admin')
  getPostsPagedForAdmin(@Query() dto: PostGetPagingDto,
                        @Param('toonId', ParseIntPipe) toonId: number) {
    return this.postService.getPostsPaged(dto, true, toonId);
  }

  @ApiOperation({
    summary: '내 게시물 전체 조회 기능',
    description: 'ACTIVE 상태인 내가 등록한 게시물을 모두 조회한다. 페이징 처리를 위한 page 파라미터가 필수이다. 로그인한 사용자만 접근이 가능하다.'
  })
  @ApiResponse({ status: 200, type: PostResponse, description: '내 게시물 전체 조회 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Get('user/post')
  getUserPosts(@Query() dto: PostGetPagingDto, @CurrentUser() user: UserResponse) {
    return this.postService.getUserPosts(dto, user.id, false);
  }

  @ApiOperation({
    summary: '(관리자용)유저 게시물 전체 조회 기능',
    description: '해당 유저가 등록한 게시물을 모두 조회한다. 페이징 처리를 위한 page 파라미터가 필수이다. 관리자로 로그인한 사용자만 접근이 가능하다.'
  })
  @ApiParam({ name: 'userId', description: '유저의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '관리자용 해당 유저 전체 조회 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('user/:userId/post/admin')
  getUserPostsForAdmin(@Param('userId', ParseIntPipe) userId: number, @Query() dto: PostGetPagingAdminDto) {
    return this.postService.getUserPosts(dto, userId, true);
  }

  @ApiOperation({
    summary: '단일 게시물 조회 기능',
    description: 'ACTIVE 상태인 게시글 상세 정보를 조회한다. 본인이 작성한 글인지 여부와 상관없이 모든 활성 게시글을 조회할 수 있으며, 호출 시 조회수가 적절히 업데이트된다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '단일 게시물 조회 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('post/:postId')
  async getPost(@Param('postId', ParseIntPipe) postId: number,
                @CurrentUser() user: UserResponse | null,
                @Ip() ip: string) {
    const userIdentifier = user ? user.id.toString() : ip;
    return await this.postService.getPost(postId, false, userIdentifier)
  }

  @ApiOperation({
    summary: '(관리자용)단일 게시물 조회 기능',
    description: '모든 상태의 게시글 상세 정보를 조회한다. 관리자로 로그인한 사용자만 접근이 가능하며, 호출 시 조회수가 업데이트 되지 않는다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '관리자용 단일 게시물 조회 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('post/admin/:postId')
  getPostForAdmin(@Param('postId', ParseIntPipe) postId: number) {
    return this.postService.getPost(postId, true, '')
  }

  @ApiOperation({
    summary: '게시물 수정 기능',
    description: '내 게시물을 수정 후 반환한다. 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '게시물 수정 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiResponse({ status: 403, description: '내 게시물이 아님' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Patch('post/:postId')
  updatePost(@Param('postId', ParseIntPipe) postId: number, @Body() body: PostUpdateDto, @CurrentUser() user: UserResponse) {
    return this.postService.updatePost(postId, body, user.id);
  }

  @ApiOperation({
    summary: '(관리자용) 게시물 상태 변경 기능',
    description: '해당 게시물을 수정 후 반환한다. 관리자로 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: PostResponse, description: '게시물 상태 수정 성공' })
  @ApiResponse({ status: 400, description: '게시물을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('post/:postId/status')
  updatePostStatus(@Param('postId', ParseIntPipe) postId: number, @Body() body: PostUpdateStatusDto) {
    return this.postService.updateStatus(postId, body.status);
  }

  @ApiOperation({
    summary: '게시물 삭제 기능',
    description: '내 게시물을 삭제한다. Soft Delete 방식이며, 로그인한 사용자만 접근 가능하다.'
  })
  @ApiParam({ name: 'postId', description: '게시물의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, description: '게시물 삭제 성공' })
  @ApiResponse({ status: 403, description: '내 게시물이 아님' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Delete('post/:postId')
  deletePost(@Param('postId', ParseIntPipe) postId: number, @CurrentUser() user: UserResponse) {
    return this.postService.deletePost(postId, user.id);
  }
}
