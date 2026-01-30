import {Controller, Param, ParseIntPipe, Post, UseGuards} from '@nestjs/common';
import {FavoriteService} from "./favorite.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {UserResponse} from "../user/dto/user.response";
import {CurrentUser} from "../decorators/user.decorator";
import {ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {ApiAuthDocs} from "../decorators/auth.docs.decorator";
import {FavoriteResponse} from "./dto/favorite.response";

@Controller('toon/:id/favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {
  }

  @ApiOperation({
    summary: '웹툰 게시판 즐겨찾기/즐겨찾기 취소 기능',
    description: '해당 게시판의 즐겨찾기를 설정 또는 해제한다. 로그인한 사용자만 접근 가능하며, 웹툰의 favoriteCount가 업데이트 된다.'
  })
  @ApiParam({ name: 'id', description: '웹툰의 고유 식별자 (ID)', example: 1 })
  @ApiResponse({ status: 200, type: FavoriteResponse, description: '웹툰 게시판 즐겨찾기/즐겨찾기 취소 성공' })
  @ApiResponse({ status: 400, description: '웹툰을 찾을 수 없음' })
  @ApiAuthDocs()
  @UseGuards(JwtAuthGuard)
  @Post()
  toggleFavorite(@Param('id', ParseIntPipe) id: number,
                 @CurrentUser() user: UserResponse) {
    return this.favoriteService.toggleFavorite(user.id, id);
  }
}
