import {Test, TestingModule} from '@nestjs/testing';
import {LikeService} from '../../src/like/like.service';
import {LikeRepository} from "../../src/like/like.repository";
import {PostRepository} from "../../src/post/post.repository";
import {ExceptionCode} from "../../src/exception/exception.code";

describe('LikeService', () => {
  let likeService: LikeService;
  let likeRepository: LikeRepository;
  let postRepository: PostRepository;
  const mockLikeRepository = {
    existsPostLike: jest.fn(),
    savePostLike: jest.fn(),
    deletePostLike: jest.fn(),
  }

  const mockPostRepository = {
    existsById: jest.fn(),
    updateLikeCount: jest.fn(),
  }

  const response = {
    id: 1,
    postId: 1,
    userId: 1,
    createdAt: new Date()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikeService, {
        provide: LikeRepository,
        useValue: mockLikeRepository,
      },{
        provide: PostRepository,
        useValue: mockPostRepository,
      }],
    }).compile();

    likeService = module.get<LikeService>(LikeService);
    likeRepository = module.get<LikeRepository>(LikeRepository);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(likeService).toBeDefined();
    expect(likeRepository).toBeDefined();
    expect(postRepository).toBeDefined();
  });

  it('게시물 좋아요 1번 토글 성공', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(true);
    (likeRepository.existsPostLike as jest.Mock).mockResolvedValue(false);
    (likeRepository.savePostLike as jest.Mock).mockResolvedValue(response);

    const result = await likeService.togglePostLike(response.userId, response.postId);
    console.log(JSON.stringify(result, null, 2));
    expect(postRepository.existsById).toHaveBeenCalledWith(response.postId);
    expect(postRepository.updateLikeCount).toHaveBeenCalledWith(response.postId, 1);
    expect(likeRepository.existsPostLike).toHaveBeenCalledWith(response.userId, response.postId);
    expect(likeRepository.savePostLike).toHaveBeenCalledWith(response.userId, response.postId);
    expect(result.liked).toEqual(true);
  });

  it('게시물 좋아요 2번 토글 성공', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(true);
    (likeRepository.existsPostLike as jest.Mock).mockResolvedValue(true);
    (likeRepository.deletePostLike as jest.Mock).mockResolvedValue(response);

    const result = await likeService.togglePostLike(response.userId, response.postId);
    console.log(JSON.stringify(result, null, 2));
    expect(postRepository.existsById).toHaveBeenCalledWith(response.postId);
    expect(postRepository.updateLikeCount).toHaveBeenCalledWith(response.postId, -1);
    expect(likeRepository.existsPostLike).toHaveBeenCalledWith(response.userId, response.postId);
    expect(likeRepository.deletePostLike).toHaveBeenCalledWith(response.userId, response.postId);
    expect(result.liked).toEqual(false);
  });

  it('게시물 좋아요 토글 실패 (게시물을 찾을 수 없음)', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(likeService.togglePostLike(response.userId, response.postId)).rejects.toThrow(ExceptionCode.POST_NOT_FOUND.message);
    expect(postRepository.existsById).toHaveBeenCalledWith(response.postId);
  });
});
