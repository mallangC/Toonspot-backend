import {Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {AuthService} from "../auth/auth.service";
import {UserRegisterDto} from "./dto/user.register.dto";
import {UserLoginDto} from "./dto/user.login.dto";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponse} from "./dto/userResponse";
import {Role} from "../type/user.type";
import {Roles} from "../decorators/user.roles.decorator";
import {RoleGuard} from "../auth/role.guard";
import {UserUpdateStatusDto} from "./dto/user.update.status.dto";
import {UserUpdateDto} from "./dto/user.update.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private readonly authService: AuthService) {
  }

  @Post('signup')
  signup(@Body() body: UserRegisterDto) {
    return this.userService.signup(body);
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.userService.verifyToken(token);
  }

  @Post('login')
  login(@Body() body: UserLoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserResponse) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('admin/profile/:userId')
  getProfileForAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getProfileForAdmin(userId);
  }

  @Get('nickname')
  checkNicknameExists(@Body('nickname') nickname: string) {
    return this.userService.getNicknameExists(nickname);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Patch()
  updateNickname(@CurrentUser() user: UserResponse, @Body() body: UserUpdateDto) {
    return this.userService.updateNickname(user.email, body.nickname);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':userId/status')
  updateStatus(@Param('userId', ParseIntPipe) userId: number, @Body() body: UserUpdateStatusDto) {
    return this.userService.updateStatus(userId, body.status);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Delete()
  deleteUser(@CurrentUser() user: UserResponse) {
    return this.userService.deleteUser(user.email);
  }
}
