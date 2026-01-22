import {Test, TestingModule} from '@nestjs/testing';
import {FavoriteService} from '../../src/favorite/favorite.service';
import {FavoriteRepository} from "../../src/favorite/favorite.repository";
import {ToonRepository} from "../../src/toon/toon.repository";
import {ExceptionCode} from "../../src/exception/exception.code";

describe('FavoriteService', () => {
  let favoriteService: FavoriteService;
  let favoriteRepository: FavoriteRepository;
  let toonRepository: ToonRepository;

  const mockFavoriteRepository = {
    save: jest.fn(),
    delete: jest.fn(),
    existsFavorite: jest.fn(),
  }

  const mockToonRepository = {
    existsById: jest.fn(),
    updateFavoriteCount: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteService, {
        provide: FavoriteRepository,
        useValue: mockFavoriteRepository,
      }, {
        provide: ToonRepository,
        useValue: mockToonRepository,
      }],
    }).compile();

    favoriteService = module.get<FavoriteService>(FavoriteService);
    favoriteRepository = module.get<FavoriteRepository>(FavoriteRepository);
    toonRepository = module.get<ToonRepository>(ToonRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  const dto = {
    userId: 1,
    toonId: 1,
  }

  it('should be defined', () => {
    expect(favoriteService).toBeDefined();
    expect(favoriteRepository).toBeDefined();
    expect(toonRepository).toBeDefined();
  });

  it('웹툰 즐겨찾기 1번 토글 성공', async () => {
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);
    (favoriteRepository.existsFavorite as jest.Mock).mockResolvedValue(false);

    const result = await favoriteService.toggleFavorite(dto.userId, dto.toonId);
    console.log(JSON.stringify(result, null, 2))
    expect(toonRepository.existsById).toHaveBeenCalledWith(dto.toonId);
    expect(favoriteRepository.existsFavorite).toHaveBeenCalledWith(dto.userId, dto.toonId);
    expect(favoriteRepository.save).toHaveBeenCalledWith(dto.userId, dto.toonId);
    expect(toonRepository.updateFavoriteCount).toHaveBeenCalledWith(dto.toonId, 1);
    expect(result.isFavorite).toEqual(true);
  });

  it('웹툰 즐겨찾기 2번 토글 성공', async () => {
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);
    (favoriteRepository.existsFavorite as jest.Mock).mockResolvedValue(true);

    const result = await favoriteService.toggleFavorite(dto.userId, dto.toonId);
    console.log(JSON.stringify(result, null, 2))
    expect(toonRepository.existsById).toHaveBeenCalledWith(dto.toonId);
    expect(favoriteRepository.existsFavorite).toHaveBeenCalledWith(dto.userId, dto.toonId);
    expect(favoriteRepository.delete).toHaveBeenCalledWith(dto.userId, dto.toonId);
    expect(toonRepository.updateFavoriteCount).toHaveBeenCalledWith(dto.toonId, -1);
    expect(result.isFavorite).toEqual(false);
  });

  it('웹툰 즐겨찾기 토글 실패(퉵툰을 찾을 수 없음)', async () => {
    (toonRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(favoriteService.toggleFavorite(dto.userId, dto.toonId)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);
    expect(toonRepository.existsById).toHaveBeenCalledWith(dto.toonId);
    expect(favoriteRepository.existsFavorite).not.toHaveBeenCalled();
    expect(favoriteRepository.delete).not.toHaveBeenCalled();
    expect(toonRepository.updateFavoriteCount).not.toHaveBeenCalled();
  });
});
