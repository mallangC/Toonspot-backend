import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {Role} from "../../src/type/user.type";
import {PostCreateDto} from "../../src/post/dto/post.create.dto";
import request from "supertest";
import {CommentDto} from "../../src/comment/dto/comment.dto";
import {ToonGenre, ToonProvider, ToonStatus, UserStatus} from "@prisma/client";
import {CACHE_MANAGER} from "@nestjs/cache-manager";

describe('LikeController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheManager: Cache;
  let testUser: any;
  let baseToon: any;
  let basePost: any;
  let baseComment: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideGuard(JwtAuthGuard)
        .useValue(new MockAuthGuard())
        .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }));
    await app.init();
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    prisma = module.get<PrismaService>(PrismaService);

    const userData = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
      role: Role.USER
    }

    const createToonDto = {
      id: 1,
      platformId: 1,
      provider: ToonProvider.NAVER,
      title: '테스트 웹툰1',
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

    const createPostDto = {
      title: '테스트 게시글',
      content: '테스트 게시글 내용',
    } as PostCreateDto

    const createCommentDto = {
      content: '테스트 댓글 내용',
    } as CommentDto

    testUser = await prisma.user.create({data: {...userData, status: UserStatus.ACTIVE, verificationToken: 'token'}});
    baseToon = await prisma.toon.create({data: createToonDto})
    basePost = await prisma.post.create({data: {...createPostDto, id: 1, userId: testUser.id, toonId: baseToon.id}});
    baseComment = await prisma.comment.create({data: {...createCommentDto, id: 1, userId: testUser.id, postId: basePost.id}});
    MockAuthGuard.mockUser = {
      id: testUser.id,
      email: testUser.email,
      nickname: testUser.nickname,
      role: Role.USER
    };
  });

  beforeEach(async () => {
    await prisma.postLike.deleteMany();
  });

  afterAll(async () => {
    await prisma.commentLike.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    const store = (cacheManager as any).store;
    if (store.client) {
      await store.client.quit();
    }
    await app.close();
  });

  it('POST /post/:postId/like : 좋아요 성공', async () => {
    const result = await request(app.getHttpServer())
        .post(`/post/${basePost.id}/like`);
    console.log(JSON.stringify(result.body.data, null, 2))
    expect(result.body.data.liked).toEqual(true);

    const findPost = await prisma.post.findUnique({where: {id: basePost.id}});
    console.log(JSON.stringify(findPost, null, 2))
    expect(findPost!.likeCount).toEqual(1);
  });

  it('POST /post/:postId/like : 좋아요 취소 성공', async () => {
    await prisma.post.update({where: {id: basePost.id}, data: {likeCount: 1}});
    await prisma.postLike.create({data: {postId: basePost.id, userId: testUser.id}});
    const result = await request(app.getHttpServer())
        .post(`/post/${basePost.id}/like`);

    console.log(JSON.stringify(result.body, null, 2));
    expect(result.body.data.liked).toEqual(false);

    const findPost = await prisma.post.findUnique({where: {id: basePost.id}});
    console.log(JSON.stringify(findPost, null, 2))
    expect(findPost!.likeCount).toEqual(0);
  });

  it('POST /post/:postId/like : 좋아요 실패', async () => {
    await prisma.postLike.create({data: {postId: basePost.id, userId: testUser.id}});
    return request(app.getHttpServer())
        .post(`/post/2/like`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(`게시물을 찾을 수 없습니다.`);
        })
  });

  it('POST /comment/:commentId/like : 좋아요 성공', async () => {
    const result = await request(app.getHttpServer())
        .post(`/comment/${baseComment.id}/like`);
    console.log(JSON.stringify(result.body.data, null, 2))
    expect(result.body.data.liked).toEqual(true);

    const findComment = await prisma.comment.findUnique({where: {id: baseComment.id}});
    console.log(JSON.stringify(findComment, null, 2))
    expect(findComment!.likeCount).toEqual(1);
  });

});
