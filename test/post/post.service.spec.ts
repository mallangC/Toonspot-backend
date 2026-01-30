import {Test, TestingModule} from '@nestjs/testing';
import {PostService} from '../../src/post/post.service';
import {PostRepository} from "../../src/post/post.repository";
import {UserRepository} from "../../src/user/user.repository";
import {PostCreateDto} from "../../src/post/dto/post.create.dto";
import {PostResponse} from "../../src/post/dto/post.response";
import {PostStatus, ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {ExceptionCode} from "../../src/exception/exception.code";
import {PostGetPagingDto} from "../../src/post/dto/post.get.paging.dto";
import {PostPagingResponse} from "../../src/post/dto/post.paging.response";
import {PostUpdateDto} from "../../src/post/dto/post.update.dto";
import {PostUpdateStatusDto} from "../../src/post/dto/post.update.status.dto";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {ToonRepository} from "../../src/toon/toon.repository";

describe('PostService', () => {
  let postService: PostService;
  let postRepository: PostRepository;
  let userRepository: UserRepository;
  let toonRepository: ToonRepository;
  const mockPostRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllByUserId: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    existsById: jest.fn(),
  }

  const mockUserRepository = {
    existsById: jest.fn()
  }

  const mockToonRepository = {
    existsById: jest.fn()
  }

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, {
        provide: PostRepository,
        useValue: mockPostRepository,
      }, {
        provide: UserRepository,
        useValue: mockUserRepository,
      },{
        provide: ToonRepository,
        useValue: mockToonRepository,
      }, {
        provide: CACHE_MANAGER,
        useValue: mockCacheManager,
      }],
    }).compile();

    postService = module.get<PostService>(PostService);
    postRepository = module.get<PostRepository>(PostRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    toonRepository = module.get<ToonRepository>(ToonRepository);
  });

  const baseToon = {
    id: 1,
    platformId: 1,
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
    publishDays: '월',
  }

  const dto = {
    title: '테스트 제목',
    content: '테스트 게시물 내용',
  } as PostCreateDto

  const postResponse = {
    id: 1,
    userId: 1,
    title: "테스트 제목",
    content: "테스트 게시물 내용",
    status: PostStatus.PUBLISHED,
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  } as PostResponse

  const pagingDto = {
    page: 1
  } as PostGetPagingDto

  const pagingResponse = {
    items: [postResponse],
    metadata: {
      totalCount: 1,
      totalPages: 1,
      currentPage: 1
    }
  } as PostPagingResponse

  it('should be defined', () => {
    expect(postService).toBeDefined();
    expect(postRepository).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('게시물 추가 성공', async () => {
    (postRepository.save as jest.Mock).mockResolvedValue(postResponse);
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);

    const result = await postService.createPost(dto, postResponse.userId, baseToon.id);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.save).toHaveBeenCalledWith(dto, postResponse.userId, baseToon.id);
    expect(result?.id).toEqual(postResponse.id);
  });

  it('게시물 추가 실패 (만화를 찾을 수 없음)', async () => {
    (postRepository.save as jest.Mock).mockResolvedValue(postResponse);
    (toonRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(postService.createPost(dto, postResponse.userId, baseToon.id)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);
    expect(toonRepository.existsById).toHaveBeenCalledWith(baseToon.id);
  });

  it('게시물 단일 조회 성공', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(true);
    (postRepository.findById as jest.Mock).mockResolvedValue(postResponse);

    const result = await postService.getPost(postResponse.id, true, "");
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.findById).toHaveBeenCalledWith(postResponse.id, true);
    expect(result?.id).toEqual(postResponse.id);
  });

  it('게시물 단일 조회 실패 (게시물을 찾을 수 없음)', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(postService.getPost(postResponse.id, false, '')).rejects.toThrow(ExceptionCode.POST_NOT_FOUND.message);
    expect(postRepository.existsById).toHaveBeenCalledWith(postResponse.id);
  });

  it('게시물 페이징 조회 성공', async () => {
    (postRepository.findAll as jest.Mock).mockResolvedValue(pagingResponse);
    (toonRepository.existsById as jest.Mock).mockResolvedValue(true);

    const result = await postService.getPostsPaged(pagingDto, true, baseToon.id);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.findAll).toHaveBeenCalledWith(pagingDto, true, baseToon.id);
    expect(result?.items[0].id).toEqual(postResponse.id);
  });

  it('게시물 페이징 조회 실패 (만화를 찾을 수 없음)', async () => {
    (postRepository.findAll as jest.Mock).mockResolvedValue(pagingResponse);
    (toonRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(postService.getPostsPaged(pagingDto, true, baseToon.id)).rejects.toThrow(ExceptionCode.TOON_NOT_FOUND.message);
    expect(toonRepository.existsById).toHaveBeenCalledWith(baseToon.id);
  });

  it('내 게시물 페이징 조회 성공', async () => {
    (postRepository.findAllByUserId as jest.Mock).mockResolvedValue(pagingResponse);
    (userRepository.existsById as jest.Mock).mockResolvedValue(true);

    const result = await postService.getUserPosts(pagingDto, postResponse.userId, true);
    console.log(JSON.stringify(result, null, 2))
    expect(userRepository.existsById).toHaveBeenCalledWith(postResponse.userId);
    expect(postRepository.findAllByUserId).toHaveBeenCalledWith(pagingDto, postResponse.userId, true);
    expect(result?.items[0].id).toEqual(postResponse.id);
  });

  it('내 게시물 페이징 조회 실패 (해당 유저를 찾을 수 없음)', async () => {
    (userRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(postService.getUserPosts(pagingDto, postResponse.userId, true)).rejects.toThrow(ExceptionCode.USER_NOT_FOUND.message);
    expect(userRepository.existsById).toHaveBeenCalledWith(postResponse.userId);
    expect(postRepository.findAllByUserId).not.toHaveBeenCalledWith(pagingDto, postResponse.userId, true);
  });

  it('게시물 업데이트 성공', async () => {
    const dto = {
      title: '업데이트 제목',
      content: '업데이트 게시물 내용',
    } as PostUpdateDto

    (postRepository.findById as jest.Mock).mockResolvedValue(postResponse);
    (postRepository.update as jest.Mock).mockResolvedValue({...postResponse, ...dto});

    const result = await postService.updatePost(postResponse.id, dto, postResponse.userId);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.findById).toHaveBeenCalledWith(postResponse.userId, false);
    expect(postRepository.update).toHaveBeenCalledWith(postResponse.id, dto);
    expect(result?.title).toEqual(dto.title);
    expect(result?.content).toEqual(dto.content);
  });

  it('게시물 업데이트 실패 (해당 userId가 내 userId와 맞지 않음)', async () => {
    const dto = {
      title: '업데이트 제목',
      content: '업데이트 게시물 내용',
    } as PostUpdateDto

    (postRepository.findById as jest.Mock).mockResolvedValue({...postResponse, userId: 2});

    await expect(postService.updatePost(postResponse.id, dto, postResponse.userId)).rejects.toThrow(ExceptionCode.POST_NOT_OWNER.message);
    expect(postRepository.findById).toHaveBeenCalledWith(postResponse.userId, false);
  });

  it('게시물 상태 업데이트 성공', async () => {
    const dto = {
      status: PostStatus.HIDDEN
    } as PostUpdateStatusDto

    (postRepository.existsById as jest.Mock).mockResolvedValue({id: postResponse.id});
    (postRepository.updateStatus as jest.Mock).mockResolvedValue({...postResponse, ...dto});

    const result = await postService.updateStatus(postResponse.id, dto.status);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.existsById).toHaveBeenCalledWith(postResponse.id);
    expect(postRepository.updateStatus).toHaveBeenCalledWith(postResponse.id, dto.status);
    expect(result?.status).toEqual(dto.status);
  });

  it('게시물 상태 업데이트 실패 (해당 게시물을 찾을 수 없음)', async () => {
    const dto = {
      status: PostStatus.HIDDEN
    } as PostUpdateStatusDto

    (postRepository.existsById as jest.Mock).mockResolvedValue(null);

    await expect(postService.updateStatus(postResponse.id, dto.status)).rejects.toThrow(ExceptionCode.POST_NOT_FOUND.message);
    expect(postRepository.existsById).toHaveBeenCalledWith(postResponse.id);
  });

  it('게시물 삭제 처리 성공', async () => {

    (postRepository.findById as jest.Mock).mockResolvedValue(postResponse);
    (postRepository.delete as jest.Mock).mockResolvedValue(`${postResponse.id}번 게시물이 삭제되었습니다.`);

    const result = await postService.deletePost(postResponse.id, postResponse.userId);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.findById).toHaveBeenCalledWith(postResponse.id, false);
    expect(postRepository.delete).toHaveBeenCalledWith(postResponse.id);
    expect(result).toEqual(`${postResponse.id}번 게시물이 삭제되었습니다.`);
  });
});
