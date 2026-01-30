import {Injectable} from '@nestjs/common';
import {FavoriteRepository} from "./favorite.repository";
import {ToonRepository} from "../toon/toon.repository";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {FavoriteResponse} from "./dto/favorite.response";

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepository: FavoriteRepository,
              private readonly toonRepository: ToonRepository,) {
  }

  async toggleFavorite(userId: number, id: number): Promise<FavoriteResponse> {
    await this.checkToon(id);
    const existsFavorite = await this.favoriteRepository.existsFavorite(userId, id);
    if (existsFavorite) {
      await this.favoriteRepository.delete(userId, id);
      this.toonRepository.updateFavoriteCount(id, -1);
      return {isFavorite: false}
    } else {
      await this.favoriteRepository.save(userId, id);
      this.toonRepository.updateFavoriteCount(id, 1);
      return {isFavorite: true}
    }
  }

  private async checkToon(id: number) {
    const existsToon = await this.toonRepository.existsById(id);
    if (!existsToon) {
      throw new CustomException(ExceptionCode.TOON_NOT_FOUND);
    }
  }
}
