import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {ToonService} from "./toon.service";
import {ToonCreateDto} from "./dto/toon.create.dto";
import {ToonGetPagingDto} from "./dto/toon.get.paging.dto";
import {ToonUpdateDto} from "./dto/toon.update.dto";
import {ToonActiveDto} from "./dto/toon.active.dto";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {RoleGuard} from "../auth/role.guard";
import {Roles} from "../decorators/user.roles.decorator";
import {Role} from "../type/user.type";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";
import {ToonResponse} from "./dto/toon.response";
import {OptionalJwtAuthGuard} from "../auth/jwt/optional.jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "../user/dto/user.response";

@Controller('toon')
export class ToonController {
  constructor(private readonly toonService: ToonService) {
  }

  @ApiOperation({
    summary: '웹툰 추가 기능',
    description: '스케쥴러로 추가되지 않은 웹툰을 추가합니다. 추가된 웹툰은 활성화 상태로 등록됩니다. 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiResponse({status: 200, type: ToonResponse, description: '웹툰 추가 성공'})
  @ApiResponse({status: 400, description: '웹툰이 이미 존재함'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Post()
  createToon(@Body() body: ToonCreateDto) {
    return this.toonService.createToon(body);
  }

  @ApiOperation({
    summary: '웹툰 전체 조회 기능',
    description: 'isActive=true 상태의 웹툰을 조회한다. 페이징 처리를 위한 page 파라미터가 필수이며 공급자, 성인유무, 필터를 사용할 수 있다.'
  })
  @ApiResponse({status: 200, type: ToonResponse, description: '웹툰 전체 조회 성공'})
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getAllToons(@Query() body: ToonGetPagingDto, @CurrentUser() user: UserResponse | null) {
    return this.toonService.getToonsPaged(body, false, user ? user.id : null);
  }

  @ApiOperation({
    summary: '(관리자용)웹툰 전체 조회 기능',
    description: '모든 웹툰을 조회한다. 페이징 처리를 위한 page 파라미터가 필수이며 공급자, 성인유무, 필터를 사용할 수 있다. 관리자로 로그인한 사용자만 접근이 가능하다.'
  })
  @ApiResponse({status: 200, type: ToonResponse, description: '관리자용 웹툰 전체 조회 성공'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getAllToonsForAdmin(@Query() body: ToonGetPagingDto) {
    return this.toonService.getToonsPaged(body, true, null);
  }

  @ApiOperation({
    summary: '웹툰 단일 조회',
    description: 'isActive=true 상태의 웹툰을 단일 조회한다.'
  })
  @ApiParam({name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1})
  @ApiResponse({status: 200, type: ToonResponse, description: '웹툰 단일 조회 성공'})
  @ApiResponse({status: 400, description: '웹툰을 찾을 수 없음'})
  @Get(":id")
  getToon(@Param('id', ParseIntPipe) id: number) {
    return this.toonService.getToon(id, false);
  }

  @ApiOperation({
    summary: '(관리자용) 웹툰 단일 조회',
    description: '모든 상태의 웹툰을 단일 조회한다. 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiParam({name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1})
  @ApiResponse({status: 200, type: ToonResponse, description: '관리자용 웹툰 단일 조회 성공'})
  @ApiResponse({status: 400, description: '웹툰을 찾을 수 없음'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get("admin/:id")
  getToonForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.toonService.getToon(id, true);
  }

  @ApiOperation({
    summary: '웹툰 수정 기능',
    description: '해당 웹툰 데이터를 수정합니다. 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiParam({name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1})
  @ApiResponse({status: 200, type: ToonResponse, description: '웹툰 수정 성공'})
  @ApiResponse({status: 400, description: '웹툰을 찾을 수 없음'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  updateToon(@Param('id', ParseIntPipe) id: number, @Body() body: ToonUpdateDto) {
    return this.toonService.updateToon(id, body);
  }

  @ApiOperation({
    summary: '웹툰 활성화/비활성화 기능',
    description: '웹툰의 상태를 활성화 혹은 비활성화 합니다. 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiParam({name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1})
  @ApiResponse({status: 200, type: ToonResponse, description: '웹툰 활성화/비활성화 성공'})
  @ApiResponse({status: 400, description: '웹툰을 찾을 수 없음'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/active')
  changeActiveToon(@Param('id', ParseIntPipe) id: number, @Body() body: ToonActiveDto) {
    return this.toonService.changeActiveToon(id, body);
  }

  @ApiOperation({
    summary: '웹툰 삭제 기능',
    description: '해당 웹툰을 삭제합니다. Hard Delete 방식으로 처리되며, 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiParam({name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1})
  @ApiResponse({status: 200, description: '웹툰 삭제 성공'})
  @ApiResponse({status: 400, description: '웹툰을 찾을 수 없음'})
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Delete(":id")
  async deleteToon(@Param('id', ParseIntPipe) id: number) {
    await this.toonService.deleteToon(id);
    return `${id}번 웹툰이 삭제되었습니다.`
  }
}
