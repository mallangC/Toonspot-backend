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

@Controller('toon')
export class ToonController {
  constructor(private readonly toonService: ToonService) {
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Post()
  createToon(@Body() body: ToonCreateDto) {
    return this.toonService.createToon(body);
  }

  @Get()
  getAllToons(@Query() body: ToonGetPagingDto) {
    return this.toonService.getToonsPaged(body);
  }

  @Get(":id")
  getToon(@Param('id', ParseIntPipe) id: number) {
    return this.toonService.getToon(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch()
  updateToon(@Body() body: ToonUpdateDto) {
    return this.toonService.updateToon(body);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch('active')
  changeActiveToon(@Body() body: ToonActiveDto) {
    return this.toonService.changeActiveToon(body);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Delete(":id")
  async deleteToon(@Param('id', ParseIntPipe) id: number) {
    await this.toonService.deleteToon(id);
    return `${id}번 웹툰이 삭제되었습니다.`
  }




}
