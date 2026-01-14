import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {Role} from "../../src/type/user.type";
import {PostCreateDto} from "../../src/post/dto/post.create.dto";
import {CommentDto} from "../../src/comment/dto/comment.dto";
import {CommentUpdateStatusDto} from "../../src/comment/dto/comment.update.status.dto";
import {CommentStatus, UserStatus} from "@prisma/client";
import request from "supertest";
import {ExceptionCode} from "../../src/exception/exception.code";

describe('CommentController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let adminUser: any;
  let basePost: any;

  const CreateDto = {
    content: '테스트 댓글 내용',
  } as CommentDto

  const updateDto = {
    content: '업데이트된 댓글 내용',
  } as CommentDto

  const updateStatusDto = {
    status: CommentStatus.HIDDEN
  } as CommentUpdateStatusDto

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
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.toon.deleteMany();
    await prisma.user.deleteMany();
    const userData = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
      role: Role.USER
    }
    const adminData = {
      id: 2,
      email: 'admin@email.com',
      password: 'password1234',
      nickname: '김어드민',
      role: Role.ADMIN
    }

    const postData = {
      title: '테스트 게시글',
      content: '테스트 게시글 내용',
    } as PostCreateDto
    testUser = await prisma.user.create({data: {...userData, status: UserStatus.ACTIVE, verificationToken: 'token'}});
    adminUser = await prisma.user.create({data: {...adminData, status: UserStatus.ACTIVE, verificationToken: 'token2'}});
    basePost = await prisma.post.create({data: {...postData, userId: testUser.id, id:1}});
  });

  beforeEach(async () => {
    await prisma.comment.deleteMany();
    MockAuthGuard.mockUser = {
      id: testUser.id,
      email: testUser.email,
      nickname: testUser.nickname,
      role: Role.USER
    };
  });

  afterAll(async () => {
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.toon.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /post/:postId/comment : 댓글 등록 성공', () => {
    return request(app.getHttpServer())
        .post(`/post/${basePost.id}/comment`)
        .send(CreateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.content).toEqual(CreateDto.content);
          expect(res.body.data.postId).toEqual(basePost.id);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(CommentStatus.PUBLISHED);
        })
  });

  it('POST /post/:postId/comment : 댓글 등록 살패', () => {
    return request(app.getHttpServer())
        .post(`/post/9304/comment`)
        .send(CreateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.POST_NOT_FOUND.message);
        })
  });

  it('GET /post/:postId/comment : 댓글 전체 조회 성공', async () => {
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id}});
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, status: CommentStatus.HIDDEN}});
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, status: CommentStatus.DELETED}});

    return request(app.getHttpServer())
        .get(`/post/${basePost.id}/comment`)
        .send(CreateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.length).toEqual(1);
        })
  });

  it('GET /post/:postId/admin/comment : (관리자) 댓글 전체 조회 성공', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id}});
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, status: CommentStatus.HIDDEN}});
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, status: CommentStatus.DELETED}});

    return request(app.getHttpServer())
        .get(`/post/${basePost.id}/admin/comment`)
        .send(CreateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.length).toEqual(3);
        })
  });

  it('PATCH /comment/:commentId : 댓글 수정 성공', async () => {
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch(`/comment/1`)
        .send(updateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.content).toEqual(updateDto.content);
        })
  });

  it('PATCH /comment/:commentId : 댓글 수정 실패 (댓글을 찾을 수 없음)', async () => {
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch(`/comment/2`)
        .send(updateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.COMMENT_NOT_FOUND.message);
        })
  });

  it('PATCH /comment/:commentId : 댓글 수정 실패 (댓글에 권한이 없음)', async () => {
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: adminUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch(`/comment/1`)
        .send(updateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.COMMENT_NOT_OWNER.message);
        })
  });

  it('PATCH /comment/:commentId/status : (관리자) 댓글 상태 변경 성공', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch(`/comment/1/status`)
        .send(updateStatusDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.status).toEqual(CommentStatus.HIDDEN);
        })
  });

  it('DELETE /comment/:commentId : 댓글 상태 변경 성공', async () => {
    await prisma.comment.create({data: {...CreateDto, postId: basePost.id, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .delete(`/comment/1`)
        .send(updateStatusDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data).toEqual(`${1}번 댓글이 삭제되었습니다.`);
        })
  });

});
