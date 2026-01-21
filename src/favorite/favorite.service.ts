import {Injectable} from '@nestjs/common';
import {FavoriteRepository} from "./favorite.repository";
import {ToonRepository} from "../toon/toon.repository";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepository: FavoriteRepository,
              private readonly toonRepository: ToonRepository,) {
  }

  async toggleFavorite(userId: number, toonId: number) {
    await this.checkToon(toonId);
    const existsFavorite = await this.favoriteRepository.existsFavorite(userId, toonId);
    if (existsFavorite) {
      this.favoriteRepository.delete(userId, toonId);
      this.toonRepository.updateFavoriteCount(toonId, -1);
      return {isFavorite: false}
    } else {
      this.favoriteRepository.save(userId, toonId);
      this.toonRepository.updateFavoriteCount(toonId, 1);
      return {isFavorite: true}
    }
  }

  private async checkToon(toonId: number) {
    const existsToon = await this.toonRepository.existsById(toonId);
    if (!existsToon) {
      throw new CustomException(ExceptionCode.TOON_NOT_FOUND);
    }
  }
}
