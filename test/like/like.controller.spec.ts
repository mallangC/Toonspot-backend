import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {Role} from "../../src/type/user.type";
import {PostCreateDto} from "../../src/post/dto/post.create.dto";
import request from "supertest";

describe('LikeController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let basePost: any;

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
    prisma = module.get<PrismaService>(PrismaService);

    const userData = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
      role: Role.USER
    }

    const createPostDto = {
      title: '테스트 게시글',
      content: '테스트 게시글 내용',
    } as PostCreateDto

    testUser = await prisma.user.create({data: userData});
    basePost = await prisma.post.create({data: {...createPostDto, id: 1, userId: testUser.id}});
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
    await prisma.postLike.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('PATCH /like/:postId : 좋아요 성공', async () => {
    const result = await request(app.getHttpServer())
        .post(`/like/${basePost.id}`);
    console.log(JSON.stringify(result.body.data, null, 2))
    expect(result.body.data.liked).toEqual(true);

    const findPost = await prisma.post.findUnique({where: {id: basePost.id}});
    console.log(JSON.stringify(findPost, null, 2))
    expect(findPost!.likeCount).toEqual(1);

  });

  it('PATCH /like/:postId : 좋아요 취소 성공', async () => {
    await prisma.post.update({where: {id: basePost.id}, data: {likeCount: {increment: 1}}});
    await prisma.postLike.create({data: {postId: basePost.id, userId: testUser.id}});
    const result = await request(app.getHttpServer())
        .post(`/like/${basePost.id}`);

    console.log(JSON.stringify(result.body, null, 2));
    expect(result.body.data.liked).toEqual(false);

    const findPost = await prisma.post.findUnique({where: {id: basePost.id}});
    console.log(JSON.stringify(findPost, null, 2))
    expect(findPost!.likeCount).toEqual(0);
  });

  it('PATCH /like/:postId : 좋아요 실패', async () => {
    await prisma.postLike.create({data: {postId: basePost.id, userId: testUser.id}});
    return request(app.getHttpServer())
        .post(`/like/2`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(`게시물을 찾을 수 없습니다.`);
        })
  });

});
