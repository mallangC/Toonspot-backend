import {Test, TestingModule} from '@nestjs/testing';
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {PrismaService} from "../../prisma/prisma.service";
import {Role} from "../../src/type/user.type";
import request from "supertest";
import {PostCreateDto} from "../../src/post/dto/post.create.dto";
import {PostStatus, UserStatus} from "@prisma/client";
import {ExceptionCode} from "../../src/exception/exception.code";
import {PostUpdateDto} from "../../src/post/dto/post.update.dto";
import {PostUpdateStatusDto} from "../../src/post/dto/post.update.status.dto";

describe('PostController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUser: any;
  let adminUser: any;

  const createDto = {
    title: '테스트 게시글',
    content: '테스트 게시글 내용',
  } as PostCreateDto

  const updateDto = {
    title: '수정된 게시글 제목',
    content: '수정된 게시글 내용',
  } as PostUpdateDto;

  const updateStatusDto = {
    status: PostStatus.HIDDEN
  } as PostUpdateStatusDto

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
    const adminData = {
      id: 2,
      email: 'admin@email.com',
      password: 'password1234',
      nickname: '김어드민',
      role: Role.ADMIN
    }
    testUser = await prisma.user.create({data: {...userData, status: UserStatus.ACTIVE, verificationToken: 'token'}});
    adminUser = await prisma.user.create({data: {...adminData, status: UserStatus.ACTIVE, verificationToken: 'token2'}});
  });

  beforeEach(async () => {
    await prisma.post.deleteMany();
    MockAuthGuard.mockUser = {
      id: testUser.id,
      email: testUser.email,
      nickname: testUser.nickname,
      role: Role.USER
    };
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.toon.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('POST /post : 게시글 등록 성공', () => {
    return request(app.getHttpServer())
        .post('/post')
        .send(createDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.title).toEqual(createDto.title);
          expect(res.body.data.content).toEqual(createDto.content);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('GET /post?page=1 : 게시글 페이징 조회 성공', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: testUser.id, status: PostStatus.HIDDEN}});

    return request(app.getHttpServer())
        .get('/post?page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(1);
          expect(res.body.data.items[0].title).toEqual(createDto.title);
          expect(res.body.data.items[0].content).toEqual(createDto.content);
          expect(res.body.data.items[0].userId).toEqual(testUser.id);
          expect(res.body.data.items[0].status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('GET /post/admin?page=1 : (관리자) 게시글 페이징 조회 성공', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: adminUser.id}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id, status: PostStatus.HIDDEN}});

    return request(app.getHttpServer())
        .get('/post/admin?page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(2);
          expect(res.body.data.items[0].title).toEqual(createDto.title);
          expect(res.body.data.items[0].content).toEqual(createDto.content);
          expect(res.body.data.items[0].userId).toEqual(adminUser.id);
          expect(res.body.data.items[0].status).toEqual(PostStatus.HIDDEN);
        })
  });

  it('GET /post/admin?page=1 : (관리자) 게시글 페이징 조회 실패 (관리자가 아님)', async () => {
    await prisma.post.create({data: {...createDto, userId: adminUser.id}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id, status: PostStatus.HIDDEN}});

    return request(app.getHttpServer())
        .get('/post/admin?page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.UNAUTHORIZED.message);
        })
  });

  it('GET /post/me : 내 게시글 조회 성공', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id}});

    return request(app.getHttpServer())
        .get('/post/me?page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(2);
          expect(res.body.data.items[0].title).toEqual(createDto.title);
          expect(res.body.data.items[0].content).toEqual(createDto.content);
          expect(res.body.data.items[0].userId).toEqual(testUser.id);
          expect(res.body.data.items[0].status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('GET /post/me : 해당 유저 게시글 조회 성공 (관리자)', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id}});

    return request(app.getHttpServer())
        .get('/post/admin/me?userId=1&page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(2);
          expect(res.body.data.items[0].title).toEqual(createDto.title);
          expect(res.body.data.items[0].content).toEqual(createDto.content);
          expect(res.body.data.items[0].userId).toEqual(testUser.id);
          expect(res.body.data.items[0].status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('GET /post/me : (관리자) 해당 유저 게시글 조회 실패 (해당 유저를 찾을 수 없음)', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: testUser.id}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id}});

    return request(app.getHttpServer())
        .get('/post/admin/me?userId=3&page=1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.USER_NOT_FOUND.message);
        })
  });

  it('GET /post/:id : 단일 게시물 조회 성공', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .get('/post/1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.title).toEqual(createDto.title);
          expect(res.body.data.content).toEqual(createDto.content);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('GET /post/:id : 단일 게시물 조회 실패 (일반 유저 > 상태 HIDDEN, DELETE 조회 불가)', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1, status: PostStatus.HIDDEN}});

    return request(app.getHttpServer())
        .get('/post/1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.POST_NOT_FOUND.message);
        })
  });

  it('GET /post/admin/:id : (관리자) 단일 게시물 조회 성공 (관리자 > 상태 HIDDEN, DELETE 조회 가능)', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1, status: PostStatus.HIDDEN}});

    return request(app.getHttpServer())
        .get('/post/admin/1')
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.title).toEqual(createDto.title);
          expect(res.body.data.content).toEqual(createDto.content);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(PostStatus.HIDDEN);
        })
  });

  it('PATCH /post/:id : 게시물 수정 성공', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch('/post/1')
        .send(updateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.title).toEqual(updateDto.title);
          expect(res.body.data.content).toEqual(updateDto.content);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(PostStatus.PUBLISHED);
        })
  });

  it('PATCH /post/:id : 게시물 수정 실패 (자신의 게시물이 아님)', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});
    await prisma.post.create({data: {...createDto, userId: adminUser.id, id: 2}});

    return request(app.getHttpServer())
        .patch('/post/2')
        .send(updateDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.POST_NOT_OWNER.message);
        })
  });

  it('PATCH /post/status/:id : 게시물 수정 성공', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch('/post/status/1')
        .send(updateStatusDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.title).toEqual(createDto.title);
          expect(res.body.data.content).toEqual(createDto.content);
          expect(res.body.data.userId).toEqual(testUser.id);
          expect(res.body.data.status).toEqual(updateStatusDto.status);
        })
  });

  it('PATCH /post/status/:id : 게시물 수정 실패 (일반 유저 > 접근 불가)', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch('/post/status/1')
        .send(updateStatusDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.UNAUTHORIZED.message);
        })
  });

  it('PATCH /post/status/:id : 게시물 수정 실패 (게시물을 찾을 수 없음)', async () => {
    MockAuthGuard.mockUser = {
      id: adminUser.id,
      email: adminUser.email,
      nickname: adminUser.nickname,
      role: Role.ADMIN
    };
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .patch('/post/status/2')
        .send(updateStatusDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.POST_NOT_FOUND.message);
        })
  });


  it('DELETE /post/:id : 게시물 삭제 처리 성공 (soft delete)', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    const result = await request(app.getHttpServer())
        .delete('/post/1')
        .send(updateStatusDto);
    expect(result.body.data).toEqual('1번 게시물이 삭제되었습니다.');

    const findPost = await prisma.post.findUnique({where: {id: 1}});
    expect(findPost!.status).toEqual(PostStatus.DELETED);
  });

  it('DELETE /post/:id : 게시물 삭제 처리 실패 (게시물을 찾을 수 없음)', async () => {
    await prisma.post.create({data: {...createDto, userId: testUser.id, id: 1}});

    return request(app.getHttpServer())
        .delete('/post/2')
        .send(updateStatusDto)
        .expect(res => {
          expect(res.body.message).toEqual(ExceptionCode.POST_NOT_FOUND.message);
        });
  });
});
