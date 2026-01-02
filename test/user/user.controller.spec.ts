import {Test, TestingModule} from '@nestjs/testing';
import request from 'supertest';
import {INestApplication} from "@nestjs/common";
import {AppModule} from "../../src/app.module";
import {PrismaService} from "../../prisma/prisma.service";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {RegisterRequestDto} from "../../src/user/dto/register.request.dto";
import {LoginRequestDto} from "../../src/user/dto/login.request.dto";
import {ExceptionCode} from "../../src/exception/exception.code";
import * as bcrypt from "bcrypt";

describe('UserController', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideGuard(JwtAuthGuard)
        .useValue(new MockAuthGuard())
        .compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: 'USER'};
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /user/signup: 유저 등록 성공', () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트'
    } as RegisterRequestDto;
    return request(app.getHttpServer())
        .post('/user/signup')
        .send(dto)
        .expect(res => {
          console.log(res.body);
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.email).toEqual(dto.email);
          expect(res.body.data.password).toBeUndefined();
        })
        .expect(201);
  });

  it('POST /user/signup: 유저 등록 실패', async () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

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

  it('POST /user/login: 유저 로그인 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

    const loginRequest = {
      email: 'test@email.com',
      password: 'password1234',
    } as LoginRequestDto

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
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

    const loginRequest = {
      email: 'wrong-test@email.com',
      password: 'wrong-password1234',
    } as LoginRequestDto

    return request(app.getHttpServer())
        .post('/user/login')
        .send(loginRequest)
        .expect(res => {
          console.log(res.body);
          expect(res.body.message).toEqual(ExceptionCode.CREDENTIALS_INVALID.message);
          expect(res.body.statusCode).toEqual(401);
        })
        .expect(401);
  });

  it('GET /user/profile: 유저 내정보 조회 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

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

  it('GET /user/nickname: 닉네임 중복 확인 성공 (닉네임 중복 안됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

    return request(app.getHttpServer())
        .get('/user/nickname')
        .send({nickname: '최테스트'})
        .expect(res => {
          console.log(res.body);
          expect(res.body.data).toEqual(false);
        })
        .expect(200);
  });

  it('GET /user/nickname: 닉네임 중복 확인 성공 (닉네임 중복됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

    return request(app.getHttpServer())
        .get('/user/nickname')
        .send({nickname: '김테스트'})
        .expect(res => {
          console.log(res.body);
          expect(res.body.data).toEqual(true);
        })
        .expect(200);
  });

  it('GET /user: 닉네임 변경 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

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

  it('GET /user: 닉네임 변경 실패 (닉네임 중복됨)', async () => {
    const dto = {
      email: 'test@email.com',
      password: await bcrypt.hash('password1234', 10),
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

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


  it('Delete /user: 유저 삭제 처리 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트'
    } as RegisterRequestDto;
    await prisma.user.create({data: dto});

    return request(app.getHttpServer())
        .delete('/user')
        .expect(res => {
          console.log(res);
          expect(res.body.data).toEqual('아이디가 삭제되었습니다.')
        })
        .expect(200);
  });

});
