import {Test, TestingModule} from '@nestjs/testing';
import {CommentService} from '../../src/comment/comment.service';
import {PostRepository} from "../../src/post/post.repository";
import {CommentRepository} from "../../src/comment/comment.repository";
import {CommentResponse} from "../../src/comment/dto/comment.response";
import {CommentDto} from "../../src/comment/dto/comment.dto";
import {ExceptionCode} from "../../src/exception/exception.code";
import {CommentStatus} from "@prisma/client";
import {CommentUpdateStatusDto} from "../../src/comment/dto/comment.update.status.dto";

describe('CommentService', () => {
  let commentService: CommentService;
  let postRepository: PostRepository;
  let commentRepository: CommentRepository;

  const mockPostRepository = {
    existsById: jest.fn(),
  }

  const mockCommentRepository = {
    save: jest.fn(),
    findAllByPostId: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentService,
        {
          provide: PostRepository,
          useValue: mockPostRepository,
        }, {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        }],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    commentRepository = module.get<CommentRepository>(CommentRepository);
    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
    expect(commentRepository).toBeDefined();
    expect(postRepository).toBeDefined();
  });

  let userData = {
    userId: 1,
    postId: 1,
  }

  const createDto = {
    content: "테스트 댓글 내용",
  } as CommentDto

  const updateDto = {
    content: "업데이트 댓글 내용",
  } as CommentDto

  const commentResponse = {
    id: 1,
    postId: 1,
    userId: 1,
    content: "테스트 댓글 내용",
    status: CommentStatus.PUBLISHED,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  } as CommentResponse;


  it('댓글 추가 성공', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(true);
    (commentRepository.save as jest.Mock).mockResolvedValue(commentResponse);

    const result = await commentService.createComment(createDto, userData.postId, userData.userId);
    console.log(JSON.stringify(result, null, 2))
    expect(postRepository.existsById).toHaveBeenCalledWith(userData.postId);
    expect(commentRepository.save).toHaveBeenCalledWith(createDto, userData.postId, userData.userId);
    expect(result?.id).toEqual(commentResponse.id);
  });

  it('댓글 추가 실패 (게시물을 찾을 수 없음)', async () => {
    (postRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(commentService.createComment(createDto, userData.postId, userData.userId)).rejects.toThrow(ExceptionCode.POST_NOT_FOUND.message);
    expect(postRepository.existsById).toHaveBeenCalledWith(userData.postId);
    expect(commentRepository.save).not.toHaveBeenCalledWith(createDto, userData.postId, userData.userId);
  });

  it('댓글 수정 성공', async () => {
    (commentRepository.findById as jest.Mock).mockResolvedValue(commentResponse);
    (commentRepository.update as jest.Mock).mockResolvedValue({...commentResponse, ...updateDto});

    const result = await commentService.updateComment(updateDto, commentResponse.id, userData.userId);
    console.log(JSON.stringify(result, null, 2))
    expect(commentRepository.findById).toHaveBeenCalledWith(commentResponse.id);
    expect(commentRepository.update).toHaveBeenCalledWith(updateDto, commentResponse.id);
    expect(result?.id).toEqual(commentResponse.id);
    expect(result?.content).toEqual(updateDto.content);
  });

  it('댓글 수정 실패 (댓글을 찾을 수 없음)', async () => {
    (commentRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(commentService.updateComment(updateDto, commentResponse.id, userData.userId)).rejects.toThrow(ExceptionCode.COMMENT_NOT_FOUND.message);
    expect(commentRepository.findById).toHaveBeenCalledWith(commentResponse.id);
    expect(commentRepository.update).not.toHaveBeenCalledWith(updateDto, commentResponse.id);
  });

  it('댓글 수정 실패 (해당 댓글에 권한이 없음)', async () => {
    (commentRepository.findById as jest.Mock).mockResolvedValue({...commentResponse, userId: 2});

    await expect(commentService.updateComment(updateDto, commentResponse.id, userData.userId)).rejects.toThrow(ExceptionCode.COMMENT_NOT_OWNER.message);
    expect(commentRepository.findById).toHaveBeenCalledWith(commentResponse.id);
    expect(commentRepository.update).not.toHaveBeenCalledWith(updateDto, commentResponse.id);
  });

  it('댓글 상태 수정 성공', async () => {
    const dto = {
      status: CommentStatus.HIDDEN,
    } as CommentUpdateStatusDto
    (commentRepository.findById as jest.Mock).mockResolvedValue(commentResponse);
    (commentRepository.updateStatus as jest.Mock).mockResolvedValue({...commentResponse, ...dto});

    const result = await commentService.updateStatus(dto, commentResponse.id);
    console.log(JSON.stringify(result, null, 2))
    expect(commentRepository.findById).toHaveBeenCalledWith(commentResponse.id);
    expect(commentRepository.updateStatus).toHaveBeenCalledWith(dto, commentResponse.id);
    expect(result?.id).toEqual(commentResponse.id);
    expect(result?.status).toEqual(dto.status);
  });

  it('댓글 삭제 처리 성공', async () => {
    (commentRepository.findById as jest.Mock).mockResolvedValue(commentResponse);

    const result = await commentService.deleteComment(commentResponse.id, userData.userId);
    expect(commentRepository.findById).toHaveBeenCalledWith(commentResponse.id);
    expect(commentRepository.delete).toHaveBeenCalledWith(commentResponse.id);
    expect(result).toEqual(`${commentResponse.id}번 댓글이 삭제되었습니다.`);
  });
});
