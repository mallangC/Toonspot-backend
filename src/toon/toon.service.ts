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
    await this.existsToonByToonIdAndProvider(dto.toonId, dto.provider);
    return this.toonRepository.save(dto);
  }

  // 단일 조회
  async getToon(id: number): Promise<ToonResponseDto> {
    await this.existsToonById(id);
    return await this.toonRepository.findByToonIdAndProvider(id)
  }

  // 페이징 조회
  async getToonsPaged(dto: ToonGetPagingDto) {
    return this.toonRepository.findAllToons(dto.page, dto.provider, dto.isAdult, dto.sortBy, dto.order);
  }

  // 수정
  async updateToon(dto: ToonUpdateDto): Promise<ToonResponseDto> {
    await this.existsToonById(dto.id);
    await this.existsToonByToonIdAndProvider(dto.toonId, dto.provider);
    return this.toonRepository.update(dto);
  }

  // 활성화/비활성화 수정
  async changeActiveToon(dto: ToonActiveDto): Promise<ToonResponseDto> {
    await this.existsToonById(dto.id);
    return this.toonRepository.updateActiveToon(dto);
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
    const existsToon = await this.toonRepository.existsByToonIdAndProvider(toonId, provider);
    if (existsToon) {
      throw new CustomException(ExceptionCode.TOON_ALREADY_EXISTS);
    }
  }

}
