import {Body, Controller, Delete, Get, Patch, Post, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {AuthService} from "../auth/auth.service";
import {RegisterRequestDto} from "./dto/register.request.dto";
import {LoginRequestDto} from "./dto/login.request.dto";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {CurrentUser} from "../decorators/user.decorator";
import {UserResponseDto} from "./dto/user.response.dto";
import {Role} from "../type/user.type";
import {Roles} from "../decorators/user.roles.decorator";
import {RoleGuard} from "../auth/role.guard";
import {UpdateRequestDto} from "./dto/update.request.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService,
              private readonly authService: AuthService) {
  }

  @Post('signup')
  signup(@Body() body: RegisterRequestDto) {
    return this.userService.signup(body);
  }

  @Post('login')
  login(@Body() body: LoginRequestDto) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserResponseDto) {
    return user;
  }

  @Get('nickname')
  checkNicknameExists(@Body('nickname') nickname: string) {
    return this.userService.getNicknameExists(nickname);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Patch()
  updateUserDetail(@CurrentUser() user: UserResponseDto, @Body('nickname') nickname: string) {
    return this.userService.updateUserNickname(user.email, nickname);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  @Delete()
  deleteUser(@CurrentUser() user: UserResponseDto) {
    return this.userService.deleteUser(user.email);
  }
}
