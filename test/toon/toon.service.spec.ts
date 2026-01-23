import {Test, TestingModule} from '@nestjs/testing';
import {ToonService} from '../../src/toon/toon.service';
import {ToonRepository} from "../../src/toon/toon.repository";
import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {ToonCreateDto} from "../../src/toon/dto/toon.create.dto";
import {ToonResponseDto} from "../../src/toon/dto/toon.response";
import {ExceptionCode} from "../../src/exception/exception.code";
import {ToonUpdateDto} from "../../src/toon/dto/toon.update.dto";
import {ToonActiveDto} from "../../src/toon/dto/toon.active.dto";

describe('ToonService', () => {
  let toonService: ToonService;
  let toonRepository: ToonRepository;
  const mockToonRepository = {
    update: jest.fn(),
    updateAll: jest.fn(),
    updateActiveToon: jest.fn(),
    existsByPlatformIdAndProvider: jest.fn(),
    existsById: jest.fn(),
    findAllToons: jest.fn(),
    findByToonIdAndProvider: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    saveAll: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToonService, {
        provide: ToonRepository,
        useValue: mockToonRepository,
      }],
    }).compile();

    toonService = module.get<ToonService>(ToonService);
    toonRepository = module.get<ToonRepository>(ToonRepository);
  });
  const dto = {
    platformId: 1234,
    provider: ToonProvider.NAVER,
    title: '테스트 웹툰',
    authors: '테스트 저자',
    summary: '테스트 줄거리',
    genre: ToonGenre.ACTION,
    rating: 9.5,
    status: ToonStatus.ONGOING,
    isAdult: false,
    imageUrl: 'https://image.com/image.jpg',
    pageUrl: 'https://toon.com/12341234',
    totalEpisode: 20,
    publishDays: '월'
  } as ToonCreateDto;

  const foundToon = {
    id: 1,
    platformId: 1234,
    provider: ToonProvider.NAVER,
    title: '테스트 웹툰',
    authors: '테스트 저자',
    summary: '테스트 줄거리',
    genre: ToonGenre.ACTION,
    rating: 9.5,
    status: ToonStatus.ONGOING,
    isAdult: false,
    imageUrl: 'https://image.com/image.jpg',
    pageUrl: 'https://toon.com/12341234',
    totalEpisode: 20,
    publishDays: '월'
  };

  const updatedDto = {
    id: 1,
    platformId: 1234,
    provider: ToonProvider.NAVER,
    title: '업데이트 웹툰',
    authors: '업데이트 저자',
    summary: '업데이트 줄거리',
    genre: ToonGenre.ACTION,
    rating: 9.5,
    status: ToonStatus.ONGOING,
    isAdult: false,
    imageUrl: 'https://image.com/image.jpg',
    pageUrl: 'https://toon.com/12341234',
    totalEpisode: 20,
    publishDays: '월'
  } as ToonUpdateDto;

  it('should be defined', () => {
    expect(toonService).toBeDefined();
    expect(toonRepository).toBeDefined();
  });


  it('웹툰 추가 성공', async () => {
    (toonRepository.existsByPlatformIdAndProvider as jest.Mock).mockResolvedValue(false);
    (toonRepository.save as jest.Mock).mockResolvedValue(foundToon);

    const result: ToonResponseDto = await toonService.createToon(dto);
    expect(toonRepository.existsByPlatformIdAndProvider).toHaveBeenCalledWith(dto.platformId, dto.provider);
    expect(result?.id).toEqual(foundToon.id);
    expect(result?.platformId).toEqual(foundToon.platformId);
  });

  it('웹툰 추가 실패(이미 존재하는 유니크 (platformId + provider))', async () => {
    (toonRepository.existsByPlatformIdAndProvider as jest.Mock).mockResolvedValue(true);

    await expect(toonService.createToon(dto)).rejects.toThrow(ExceptionCode.TOON_ALREADY_EXISTS.message);
    expect(toonRepository.existsByPlatformIdAndProvider).toHaveBeenCalledWith(dto.platformId, dto.provider);
    expect(toonRepository.save).not.toHaveBeenCalledWith(dto);
  });

  it('웹툰 단일 조회 성공', async () => {
    const id = 1;
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);
    (toonRepository.findByToonIdAndProvider as jest.Mock).mockResolvedValue(foundToon);

    const result: ToonResponseDto = await toonService.getToon(id, false);
    expect(toonRepository.existsById).toHaveBeenCalledWith(id);
    expect(toonRepository.findByToonIdAndProvider).toHaveBeenCalledWith(id, false);
    expect(result?.id).toEqual(id);
  });

  it('웹툰 단일 조회 실패(툰을 찾을 수 없음)', async () => {
    const id = 1;
    (toonRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(toonService.getToon(id, false)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);

    expect(toonRepository.existsById).toHaveBeenCalledWith(id);
    expect(toonRepository.findByToonIdAndProvider).not.toHaveBeenCalledWith(id);
  });

  it('웹툰 수정 성공', async () => {
    const id = 1;
    (toonRepository.findById as jest.Mock).mockResolvedValue(foundToon);
    (toonRepository.update as jest.Mock).mockResolvedValue(updatedDto);

    const result: ToonResponseDto = await toonService.updateToon(updatedDto);
    expect(toonRepository.findById).toHaveBeenCalledWith(id);
    expect(toonRepository.update).toHaveBeenCalledWith(updatedDto);
    expect(result?.id).toEqual(id);
    expect(result?.title).toEqual(updatedDto.title);
    expect(result?.authors).toEqual(updatedDto.authors);
    expect(result?.summary).toEqual(updatedDto.summary);
  });

  it('웹툰 수정 실패 (id에 맞는 웹툰이 존재하지 않음)', async () => {
    const id = 1;
    (toonRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(toonService.updateToon(updatedDto)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);
    expect(toonRepository.findById).toHaveBeenCalledWith(id);
    expect(toonRepository.update).not.toHaveBeenCalledWith(updatedDto);
  });

  it('웹툰 수정 실패 (platformId + provider 조합이 이미 존재함)', async () => {
    const id = 1;
    const updateDto = {
      id: 1,
      platformId: 1010,
      provider: ToonProvider.NAVER,
      title: '테스트 웹툰',
      authors: '테스트 저자',
      summary: '테스트 줄거리',
      genre: ToonGenre.ACTION,
      rating: 9.5,
      status: ToonStatus.ONGOING,
      isAdult: false,
      imageUrl: 'https://image.com/image.jpg',
      pageUrl: 'https://toon.com/12341234',
      totalEpisode: 20,
      publishDays: '월'
    }as ToonUpdateDto;

    (toonRepository.findById as jest.Mock).mockResolvedValue(foundToon);
    (toonRepository.existsByPlatformIdAndProvider as jest.Mock).mockResolvedValue(true);

    await expect(toonService.updateToon(updateDto)).rejects.toThrow(ExceptionCode.TOON_ALREADY_EXISTS.message);
    expect(toonRepository.findById).toHaveBeenCalledWith(id);
    expect(toonRepository.existsByPlatformIdAndProvider).toHaveBeenCalledWith(updateDto.platformId, updateDto.provider);
    expect(toonRepository.update).not.toHaveBeenCalledWith(updatedDto);
  });

  it('웹툰 비/활성화 수정 성공', async () => {
    const updateDto = {
      id: 1,
      isActive: true
    } as ToonActiveDto
    const id = 1;
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);
    (toonRepository.updateActiveToon as jest.Mock).mockResolvedValue({...updatedDto, isActive: updateDto.isActive} as ToonResponseDto);

    const result: ToonResponseDto = await toonService.changeActiveToon(updateDto);
    expect(toonRepository.existsById).toHaveBeenCalledWith(id);
    expect(toonRepository.updateActiveToon).toHaveBeenCalledWith(updateDto);
    expect(result?.isActive).toEqual(updateDto.isActive);
  });

  it('웹툰 삭제 처리 성공', async () => {
    const id = 1;
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);
    (toonRepository.delete as jest.Mock).mockResolvedValue(undefined);

    await toonService.deleteToon(id);
    expect(toonRepository.existsById).toHaveBeenCalledWith(id);
    expect(toonRepository.delete).toHaveBeenCalledWith(id);
  });

  it('웹툰 삭제 처리 실패 (id로 찾을 수 없음)', async () => {
    const id = 1;
    (toonRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(toonService.deleteToon(id)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);
    expect(toonRepository.existsById).toHaveBeenCalledWith(id);
    expect(toonRepository.delete).not.toHaveBeenCalledWith(id);
  });

});
