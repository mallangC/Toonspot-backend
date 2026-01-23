import {Injectable} from '@nestjs/common';
import {ToonRepository} from "./toon.repository";
import {ToonCreateDto} from "./dto/toon.create.dto";
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {ToonGetPagingDto} from "./dto/toon.get.paging.dto";
import {ToonProvider} from "@prisma/client";
import {ToonUpdateDto} from "./dto/toon.update.dto";
import {ToonActiveDto} from "./dto/toon.active.dto";
import {ToonResponseDto} from "./dto/toon.response";

@Injectable()
export class ToonService {
  constructor(private readonly toonRepository: ToonRepository) {
  }

  // 등록
  async createToon(dto: ToonCreateDto): Promise<ToonResponseDto> {
    await this.existsToonByToonIdAndProvider(dto.platformId, dto.provider);
    return this.toonRepository.save(dto);
  }

  // 단일 조회
  async getToon(id: number, isAdmin: boolean): Promise<ToonResponseDto> {
    await this.existsToonById(id);
    const findToon = await this.toonRepository.findByToonIdAndProvider(id, isAdmin)
    if (!findToon) {
      throw new CustomException(ExceptionCode.TOON_NOT_FOUND);
    }
    return {
      ...findToon,
      rating: findToon.rating ? Number(findToon.rating) : 0
    };
  }

  // 페이징 조회
  async getToonsPaged(dto: ToonGetPagingDto, isAdmin: boolean) {
    return await this.toonRepository.findAllToons(dto, isAdmin);
  }

  // 수정
  async updateToon(dto: ToonUpdateDto): Promise<ToonResponseDto> {
    const findToon = await this.toonRepository.findById(dto.id);
    if (!findToon) {
      throw new CustomException(ExceptionCode.TOON_NOT_FOUND);
    }
    if (dto.platformId !== findToon.platformId || dto.provider !== findToon.provider) {
      await this.existsToonByToonIdAndProvider(dto.platformId, dto.provider);
    }
    return this.toonRepository.update(dto);
  }

  // 활성화/비활성화 수정
  async changeActiveToon(dto: ToonActiveDto): Promise<ToonResponseDto> {
    await this.existsToonById(dto.id);
    return await this.toonRepository.updateActiveToon(dto);
  }

  // 삭제
  async deleteToon(id: number) {
    await this.existsToonById(id);
    await this.toonRepository.delete(id);
  }

  private async existsToonById(id: number) {
    const existsToon = await this.toonRepository.existsById(id);
    if (!existsToon) {
      throw new CustomException(ExceptionCode.TOON_NOT_FOUND);
    }
  }

  private async existsToonByToonIdAndProvider(toonId: number, provider: ToonProvider) {
    const existsToon = await this.toonRepository.existsByPlatformIdAndProvider(toonId, provider);
    if (existsToon) {
      throw new CustomException(ExceptionCode.TOON_ALREADY_EXISTS);
    }
  }

}
