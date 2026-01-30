import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {ToonDto} from "./dto/toon.dto";
import {ToonUpdateDto} from "./dto/toon.update.dto";
import {ToonCreateDto} from "./dto/toon.create.dto";
import {ToonProvider} from "@prisma/client";
import {TOON_SELECT} from "../../prisma/prisma.selects";
import {ToonUpdate} from "./interface/interface.toon.update";
import {ToonResponse} from "./dto/toon.response";
import {ToonGetPagingDto} from "./dto/toon.get.paging.dto";

@Injectable()
export class ToonRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  // 저장
  save(toon: ToonCreateDto): Promise<ToonResponse> {
    return this.prisma.client.toon.create({data: toon, select: TOON_SELECT});
  }

  saveAll(toons: ToonDto[]) {
    return this.prisma.client.toon.createMany({data: toons});
  }

  // 조회
  async existsByPlatformIdAndProvider(platformId: number, provider: ToonProvider) {
    const exists = await this.prisma.toon.findUnique({
      where: {
        platformId_provider: {platformId, provider}
      },
      select: {platformId: true}
    });
    return !!exists;
  }

  async existsById(id: number) {
    const exists = await this.prisma.toon.findUnique({
      where: {
        id
      },
      select: {platformId: true}
    });
    return !!exists;
  }

  findById(id: number): Promise<ToonResponse | null> {
    return this.prisma.toon.findUnique({
      where: {id},
      select: TOON_SELECT
    });
  }

  async findAllToons(dto: ToonGetPagingDto, isAdmin: boolean, userId: number | null) {
    const pageSize = 20;
    const {page, provider, isAdult, order, sortBy} = dto;
    const whereClause = {
      ...(provider ? {provider: provider} : {}),
      ...(isAdult ? {isAdult: isAdult} : {}),
      ...(isAdmin ? {} : {isActive: true})
    };
    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.toon.count({
        where: whereClause
      }),
      this.prisma.toon.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [
          ...(userId ? [{ favoriteBy: { _count: 'desc' as const } }] : []),
          {[sortBy]: order},
          {title: 'asc' as const},
        ],
        include: {
          favoriteBy: userId ? { where: { userId } } : false,
        },
      }),
    ]);

    return {
      items: items.map((item) => {
        const isFavorite = userId ? item.favoriteBy.length > 0 : false;
        const { favoriteBy, ...rest } = item;
        return {
          ...rest,
          isFavorite,
        };
      }),
      metadata: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  }

  findByToonIdAndProvider(id: number, isAdmin: boolean): Promise<ToonResponse | null> {
    return this.prisma.toon.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : {isActive: true})
      },
      select: TOON_SELECT
    });
  }

  // 업데이트
  async updateAll(toons: ToonUpdate[]) {
    const updateToons = toons.map((toon) =>
        this.prisma.client.toon.update({
          where: {
            platformId_provider: {
              platformId: toon.platformId,
              provider: toon.provider
            }
          },
          data: {
            status: toon.status,
            totalEpisode: toon.totalEpisode,
            publishDays: toon.publishDays,
            rating: toon.rating
          },
        })
    );
    const results = await Promise.all(updateToons);
    return results.length;
  }

  update(id: number, dto: ToonUpdateDto): Promise<ToonResponse> {
    return this.prisma.client.toon.update({
      where: {id},
      data: dto,
      select: TOON_SELECT
    });
  }

  updateActiveToon(id: number, isActive: boolean): Promise<ToonResponse> {
    return this.prisma.client.toon.update({
      where: {id},
      data: {isActive},
      select: TOON_SELECT
    });
  }

  updateFavoriteCount(id: number, num: number) {
    return this.prisma.client.toon.update({
      where: {id},
      data: {favoriteCount: {increment: num}}
    })
  }

  // 삭제
  async delete(id: number) {
    await this.prisma.client.toon.delete({where: {id}});
  }
}