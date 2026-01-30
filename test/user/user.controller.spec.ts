import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {INestApplication} from "@nestjs/common";
import {AppModule} from "../../src/app.module";
import {PrismaService} from "../../prisma/prisma.service";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {UserRegisterDto} from "../../src/user/dto/user.register.dto";
import {UserLoginDto} from "../../src/user/dto/user.login.dto";
import {ExceptionCode} from "../../src/exception/exception.code";
import * as bcrypt from "bcrypt";
import {UserRole, UserStatus} from "@prisma/client";
import {UserUpdateStatusDto} from "../../src/user/dto/user.update.status.dto";
import {CACHE_MANAGER} from "@nestjs/cache-manager";

describe('UserController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const dto = {
    email: 'test@email.com',
    password: 'password1234',
    nickname: '김테스트'
  } as UserRegisterDto;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideGuard(JwtAuthGuard)
        .useValue(new MockAuthGuard())
        .compile();

    app = module.createNestApplication();
    await app.init();

    cacheManager = module.get<Cache>(CACHE_MANAGER);
    prisma = module.get<PrismaService>(PrismaService);
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: UserRole.USER};
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: UserRole.USER};
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    const store = (cacheManager as any).store;
    if (store.client) {
      await store.client.quit();
    }
    await app.close();
  });

  const testToken = 'test_token'

  it('POST /user/signup: 유저 등록 성공', () => {
    return request(app.getHttpServer())
        .post('/user/signup')
        .send(dto)
        .expect(res => {
          console.log(`${JSON.stringify(res.body, null, 2)}`);
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.email).toEqual(dto.email);
          expect(res.body.data.password).toBeUndefined();
        })
        .expect(201);
  });

  it('POST /user/signup: 유저 등록 실패', async () => {
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .post('/user/signup')
        .send(dto)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_ALREADY_EXISTS.message);
          expect(res.body.statusCode).toEqual(409);
        })
        .expect(409);
  });

  it('POST /user/verify: 이메일 인증 성공', async () => {
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .get(`/user/verify?token=${testToken}`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data).toEqual('이메인 인증이 완료되었습니다.');
        })

  });

  it('POST /user/login: 유저 로그인 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken, status: UserStatus.ACTIVE}});

    const loginRequest = {
      email: 'test@email.com',
      password: 'password1234',
    } as UserLoginDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.token).toBeDefined();
        })
        .expect(201);
  });

  it('POST /user/login: 유저 로그인 실패 (아이디나 비밀번호가 다름)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    const loginRequest = {
      email: 'wrong-test@email.com',
      password: 'wrong-password1234',
    } as UserLoginDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.CREDENTIALS_INVALID.message);
          expect(res.body.statusCode).toEqual(401);
        });
  });

  it('POST /user/login: 유저 로그인 실패 (이메일 인증 안함)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    const loginRequest = {
      email: 'test@email.com',
      password: 'password1234',
    } as UserLoginDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_ACCOUNT_PENDING.message);
        })
  });

  it('POST /user/login: 유저 로그인 실패 (사용자 계정 차단됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken, status: UserStatus.BLOCKED}});

    const loginRequest = {
      email: 'test@email.com',
      password: 'password1234',
    } as UserLoginDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_ACCOUNT_BLOCKED.message);
        })
  });

  it('POST /user/login: 유저 로그인 실패 (사용자 계정 탈퇴됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken, status: UserStatus.DELETED}});

    const loginRequest = {
      email: 'test@email.com',
      password: 'password1234',
    } as UserLoginDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_ACCOUNT_DELETED.message);
        })
  });

  it('GET /user/profile: 유저 내정보 조회 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .get('/user/profile')
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.email).toEqual('test@email.com');
          expect(res.body.data.name).toEqual('김테스트');
          expect(res.body.data.role).toEqual('USER');
        })
        .expect(200);
  });

  it('GET /user/admin/profile/:userId : (관리자)유저 정보 조회 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    const user = await prisma.user.create({data: {...dto, verificationToken: testToken, id: 1}});

    MockAuthGuard.mockUser = {email: 'admin@email.com', name: '김어드민', role: UserRole.ADMIN};

    return request(app.getHttpServer())
        .get(`/user/admin/profile/${user.id}`)
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.email).toEqual('test@email.com');
          expect(res.body.data.nickname).toEqual('김테스트');
          expect(res.body.data.role).toEqual('USER');
        })
        .expect(200);
  });

  it('GET /user/admin/profile/:userId : (관리자)유저 정보 조회 실패 (유저를 찾을 수 없음)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken, id: 1}});
    MockAuthGuard.mockUser = {email: 'admin@email.com', name: '김어드민', role: UserRole.ADMIN};

    return request(app.getHttpServer())
        .get(`/user/admin/profile/2`)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_NOT_FOUND.message);
        })
  });

  it('GET /user/nickname: 닉네임 중복 확인 성공 (닉네임 중복 안됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .get('/user/nickname')
        .send({nickname: '최테스트'})
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.isExists).toEqual(false);
        })
        .expect(200);
  });

  it('GET /user/nickname: 닉네임 중복 확인 성공 (닉네임 중복됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .get('/user/nickname')
        .send({nickname: '김테스트'})
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.isExists).toEqual(true);
        })
        .expect(200);
  });

  it('PATCH /user: 닉네임 변경 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    const updateNickname = {nickname: '최테스트'};

    return request(app.getHttpServer())
        .patch('/user')
        .send(updateNickname)
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.nickname).toEqual(updateNickname.nickname);
        })
        .expect(200);
  });

  it('PATCH /user: 닉네임 변경 실패 (닉네임 중복됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    const updateNickname = {nickname: '김테스트'};

    return request(app.getHttpServer())
        .patch('/user')
        .send(updateNickname)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.NICKNAME_ALREADY_EXISTS.message);
          expect(res.body.statusCode).toEqual(409);
        })
        .expect(409);
  });

  it('PATCH /user: (관리자) 유저 상태 변경 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    const user = await prisma.user.create({data: {...dto, verificationToken: testToken}});

    MockAuthGuard.mockUser = {email: 'admin@email.com', name: '김어드민', role: UserRole.ADMIN};

    const updateStatus = {
      status: UserStatus.BLOCKED
    } as UserUpdateStatusDto
    return request(app.getHttpServer())
        .patch(`/user/${user.id}/status`)
        .send(updateStatus)
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.status).toEqual(updateStatus.status);
        })
  });

  it('PATCH /user: (관리자) 유저 상태 변경 실패 (유저를 찾을 수 없음)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as UserRegisterDto;
    await prisma.user.create({data: {...dto, verificationToken: testToken}});
    MockAuthGuard.mockUser = {email: 'admin@email.com', name: '김어드민', role: UserRole.ADMIN};

    const updateStatus = {
      status: UserStatus.BLOCKED
    } as UserUpdateStatusDto
    return request(app.getHttpServer())
        .patch(`/user/2/status`)
        .send(updateStatus)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.USER_NOT_FOUND.message);
        })
  });

  it('Delete /user: 유저 삭제 처리 성공', async () => {
    await prisma.user.create({data: {...dto, verificationToken: testToken}});

    return request(app.getHttpServer())
        .delete('/user')
        .expect(res => {
          console.log(res.body);
          expect(res.body.data).toEqual('회원 탈퇴 되었습니다.')
        })
        .expect(200);
  });

});
