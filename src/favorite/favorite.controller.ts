import {Controller, Param, Post, UseGuards} from '@nestjs/common';
import {FavoriteService} from "./favorite.service";
import {JwtAuthGuard} from "../auth/jwt/jwt.guard";
import {UserResponse} from "../user/dto/userResponse";
import {CurrentUser} from "../decorators/user.decorator";

@Controller('toon/:toonId/favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  toggleFavorite(@Param('toonId') toonId: number, @CurrentUser() user: UserResponse) {
    return this.favoriteService.toggleFavorite(user.id, toonId);
  }
}
