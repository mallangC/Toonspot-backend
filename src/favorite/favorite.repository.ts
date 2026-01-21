import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class FavoriteRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async existsFavorite(userId: number, toonId: number) {
    const existsFavorite = await this.prisma.client.favorite.findUnique({
      where: {
        userId_toonId: {
          userId, toonId
        }
      }
    });
    return !!existsFavorite;
  }

  save(userId: number, toonId: number) {
    this.prisma.client.favorite.create({data: {userId, toonId}});
  }

  delete(userId: number, toonId: number) {
    this.prisma.client.favorite.delete({where: {userId_toonId: {userId, toonId}}});
  }
}