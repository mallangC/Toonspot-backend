import {Test, TestingModule} from '@nestjs/testing';
import {PrismaService} from "../../prisma/prisma.service";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {INestApplication} from "@nestjs/common";
import {Role} from "../../src/type/user.type";
import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {ToonCreateDto} from "../../src/toon/dto/toon.create.dto";
import request from "supertest";
import {ExceptionCode} from "../../src/exception/exception.code";

describe('ToonController', () => {
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
    const userData = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트'
    }
    await prisma.user.create({data: {...userData, role: Role.ADMIN}});
  });

  beforeEach(async () => {
    await prisma.toon.deleteMany();
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: Role.ADMIN};
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.toon.deleteMany();
    await app.close();
  });

  it('POST /toon : 툰 등록 성공', () => {
    const dto = {
      toonId: 1234,
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
      publishDays: '월'
    } as ToonCreateDto;

    return request(app.getHttpServer())
        .post('/toon')
        .send(dto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.toonId).toEqual(dto.toonId);
          expect(res.body.data.provider).toEqual(dto.provider);
          expect(res.body.data.title).toEqual(dto.title);
          expect(res.body.data.authors).toEqual(dto.authors);
          expect(res.body.data.summary).toEqual(dto.summary);
          expect(res.body.data.genre).toEqual(dto.genre);
          expect(res.body.data.rating).toEqual(dto.rating);
          expect(res.body.data.status).toEqual(dto.status);
          expect(res.body.data.isAdult).toEqual(dto.isAdult);
          expect(res.body.data.imageUrl).toEqual(dto.imageUrl);
          expect(res.body.data.pageUrl).toEqual(dto.pageUrl);
          expect(res.body.data.totalEpisode).toEqual(dto.totalEpisode);
          expect(res.body.data.publishDays).toEqual(dto.publishDays);
        })
  });

  it('POST /toon : 툰 등록 실패 (권한이 다름)', () => {
    const dto = {
      toonId: 1234,
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
      publishDays: '월'
    } as ToonCreateDto;
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: Role.USER};
    return request(app.getHttpServer())
        .post('/toon')
        .send(dto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.error).toEqual('Forbidden');
          expect(res.body.message).toEqual('접근 권한이 없습니다.');
        })
  });

  it('POST /toon : 툰 등록 실패', async () => {
    const dto = {
      toonId: 1234,
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
      publishDays: '월'
    } as ToonCreateDto;
    await prisma.toon.create({data: dto});

    return request(app.getHttpServer())
        .post('/toon')
        .send(dto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.TOON_ALREADY_EXISTS.message);
        })
  });
});
