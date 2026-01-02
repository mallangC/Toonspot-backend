import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {ToonDto} from "./dto/toon.dto";
import {ToonUpdateDto} from "./dto/toon.update.dto";
import {ToonCreateDto} from "./dto/toon.create.dto";
import {ToonProvider} from "@prisma/client";
import {TOON_SELECT} from "../../prisma/prisma.selects";
import {ToonActiveDto} from "./dto/toon.active.dto";
import {ToonUpdate} from "./interface/interface.toon.update";
import {ToonResponseDto} from "./dto/toon.response";

@Injectable()
export class ToonRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  // 저장
  async save(toon: ToonCreateDto): Promise<ToonResponseDto> {
    return this.prisma.client.toon.create({data: toon, select: TOON_SELECT});
  }

  async saveAll(toons: ToonDto[]) {
    return this.prisma.client.toon.createMany({data: toons});
  }

  // 조회
  async existsByToonIdAndProvider(toonId: number, provider: ToonProvider) {
    const exists = await this.prisma.toon.findUnique({
      where: {
        toonId_provider: {toonId, provider}
      },
      select: {toonId: true}
    });
    return !!exists;
  }

  async existsById(id: number) {
    const exists = await this.prisma.toon.findUnique({
      where: {
        id
      },
      select: {toonId: true}
    });
    return !!exists;
  }

  async findAllToons(page: number, provider: ToonProvider | undefined, isAdult: boolean | undefined, sortBy: string, order: string) {
    const pageSize = 20;
    const whereClause = {
      provider: provider,
      isAdult: isAdult
    };
    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.toon.count({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {[sortBy]: order},
      }),
      this.prisma.toon.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {[sortBy]: order},
        select: TOON_SELECT,
      }),
    ]);

    return {
      items,
      metadata: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
      },
    };
  }

  async findByToonIdAndProvider(id: number): Promise<ToonResponseDto> {
    const findToon = await this.prisma.toon.findUniqueOrThrow({
      where: {id},
      select: TOON_SELECT
    });

    return {
      ...findToon,
      rating: findToon.rating ? Number(findToon.rating) : 0
    }
  }

  // 업데이트
  async updateAll(toons: ToonUpdate[]) {
    const updateToons = toons.map((toon) =>
        this.prisma.client.toon.update({
          where: {
            toonId_provider: {
              toonId: toon.toonId,
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

  async update(dto: ToonUpdateDto): Promise<ToonResponseDto> {
    const {id, ...updateData} = dto;
    return this.prisma.client.toon.update({
      where: {id},
      data: updateData,
      select: TOON_SELECT
    });
  }

  async updateActiveToon(dto: ToonActiveDto): Promise<ToonResponseDto> {
    const {id, isActive} = dto;
    return this.prisma.client.toon.update({
      where: {id},
      data: {isActive},
      select: TOON_SELECT
    });
  }

  // 삭제
  async delete(id: number) {
    this.prisma.client.toon.update({where: {id}, data: {isActive: false}});
  }
}