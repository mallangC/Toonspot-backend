import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {AuthService} from "../auth/auth.service";
import {UserRegisterDto} from "./dto/user.register.dto";
import {UserLoginDto} from "./dto/user.login.dto";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "./dto/user.response";
import {Role} from "../type/user.type";
import {Roles} from "../decorators/user.roles.decorator";
import {RoleGuard} from "../auth/role.guard";
import {UserUpdateStatusDto} from "./dto/user.update.status.dto";
import {UserUpdateDto} from "./dto/user.update.dto";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private readonly authService: AuthService) {
  }

  @ApiOperation({
    summary: '회원가입 기능',
    description: '새로운 사용자를 등록합니다. 이메일, 닉네임 중복 검사를 포함하며, 가입 성공 시 인증 메일이 발송됩니다.'
  })
  @ApiResponse({status: 201, description: '회원가입 성공 및 이메일 인증 링크 발송'})
  @ApiResponse({ status: 409, description: '이메일 중복, 닉네임 중복' })
  @Post('signup')
  signup(@Body() body: UserRegisterDto) {
    return this.userService.signup(body);
  }

  @ApiOperation({
    summary: '이메일 인증 기능',
    description: '회원가입 시 발송된 이메일의 인증 링크의 토큰을 검증하여 계정을 활성화(ACTIVE) 상태로 변경합니다.'
  })
  @ApiResponse({ status: 200, description: '인증 성공 및 계정 활성화 완료' })
  @ApiResponse({ status: 400, description: '잘못된 인증 토큰' })
  @Get('verify')
  verify(@Query('token') token: string) {
    return this.userService.verifyToken(token);
  }

  @ApiOperation({
    summary: '로그인 기능',
    description: '이메일, 비밀번호를 입력 시 해당 계정의 인증 상태를 검증하여 토큰을 발급합니다.'
  })
  @ApiResponse({ status: 200, description: '로그인 토큰 발급' })
  @ApiResponse({ status: 401, description: '잘못된 이메일, 비밀번호' })
  @ApiResponse({ status: 403, description: '이메일 인증 안됨, 차단 혹은 삭제된 계정' })
  @Post('login')
  login(@Body() body: UserLoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({
    summary: '내 정보 조회 기능',
    description: '현재 로그인한 유저의 정보를 반환합니다. 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiResponse({ status: 200, description: '내 정보 조회 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserResponse) {
    return user;
  }

  @ApiOperation({
    summary: '(관리자용) 회원 정보 조회 기능',
    description: '해당 회원의 정보를 반환합니다. 관리자로 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiParam({ name: 'id', description: '유저의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, description: '해당 회원의 정보 조회 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin/profile/:id')
  getProfileForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getProfileForAdmin(id);
  }

  @ApiOperation({
    summary: '닉네임 확인 기능',
    description: '해당 닉네임이 이미 존재하는지 확인합니다. 존재하면 true, 없으면 false를 반환합니다.'
  })
  @ApiResponse({ status: 200, description: '닉네임 확인 성공' })
  @Get('nickname')
  checkNicknameExists(@Body('nickname') nickname: string) {
    return this.userService.getNicknameExists(nickname);
  }

  @ApiOperation({
    summary: '회원 닉네임 변경 기능',
    description: '닉네임 변경하고 해당 회원의 정보를 반환합니다. 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiResponse({ status: 200, description: '닉네임 변경 성공' })
  @ApiResponse({ status: 409, description: '중복된 닉네임' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Patch()
  updateNickname(@CurrentUser() user: UserResponse, @Body() body: UserUpdateDto) {
    return this.userService.updateNickname(user.email, body.nickname);
  }

  @ApiOperation({
    summary: '(관리자용) 해당 회원의 상태를 변경하는 기능',
    description: '해당 회원의 상태를 변경 후 반환합니다. 관리자로 로그인한 사용자만 접근 가능합니다. 상태를 BLOCKED 변경시 해당 계정의 접근이 차단됩니다.'
  })
  @ApiParam({ name: 'id', description: '유저의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, description: '회원 상태 변경 성공' })
  @ApiResponse({ status: 400, description: '회원을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UserUpdateStatusDto) {
    return this.userService.updateStatus(id, body.status);
  }

  @ApiOperation({
    summary: '회원 탈퇴 기능',
    description: '현재 로그인한 사용자를 탈퇴 처리합니다. Soft Delete 방식으로 처리되며, 이후 해당 계정의 접근이 차단됩니다. 로그인한 사용자만 접근 가능합니다.'
  })
  @ApiResponse({ status: 200, description: '회원 탈퇴 성공' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Delete()
  deleteUser(@CurrentUser() user: UserResponse) {
    return this.userService.deleteUser(user.email);
  }
}
