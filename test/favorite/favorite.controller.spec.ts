import { Test, TestingModule } from '@nestjs/testing';
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {ToonGenre, ToonProvider, ToonStatus, UserStatus} from "@prisma/client";
import {Role} from "../../src/type/user.type";
import {ToonUpdateDto} from "../../src/toon/dto/toon.update.dto";
import request from "supertest";
import {ExceptionCode} from "../../src/exception/exception.code";

describe('FavoriteController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheManager: Cache;
  let testUser: any;
  let baseToon: any;

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

    const toonDto = {
      id: 1,
      toonId: 1212,
      title: '테스트 웹툰 제목',
      authors: '테스트 저자',
      summary: '테스트 줄거리',
      genre: ToonGenre.ACTION,
      rating: 9.9,
      status: ToonStatus.ONGOING,
      isAdult: true,
      imageUrl: 'https://image.com/image.jpg.update',
      pageUrl: 'https://toon.com/12341234/update',
      totalEpisode: 20,
      publishDays: '테스트 요일',
      provider: ToonProvider.NAVER
    }as ToonUpdateDto
    testUser = await prisma.user.create({data: {...userData, status: UserStatus.ACTIVE, verificationToken: 'token'}});
    baseToon = await prisma.toon.create({data: toonDto});
    MockAuthGuard.mockUser = {
      id: testUser.id,
      email: testUser.email,
      nickname: testUser.nickname,
      role: Role.USER
    };
  });

  beforeEach(async () => {
    await prisma.favorite.deleteMany();
  });

  afterAll(async () => {
    await prisma.favorite.deleteMany();
    await prisma.toon.deleteMany();
    await prisma.user.deleteMany();
    const store = (cacheManager as any).store;
    if (store.client) {
      await store.client.quit();
    }
    await app.close();
  });

  it('POST /toon/:toonId/favorite : 웹툰 즐겨찾기 성공', async () => {
    return request(app.getHttpServer())
        .post(`/toon/${baseToon.id}/favorite`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.isFavorite).toEqual(true);
        })
  });

  it('POST /toon/:toonId/favorite : 웹툰 즐겨찾기 해제 성공', async () => {
    await prisma.favorite.create({data: {toonId: baseToon.id, userId: testUser.id}});
    return request(app.getHttpServer())
        .post(`/toon/${baseToon.id}/favorite`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.isFavorite).toEqual(false);
        })
  });

  it('POST /toon/:toonId/favorite : 웹툰 즐겨찾기 실패(만화를 찾을 수 없음)', async () => {
    return request(app.getHttpServer())
        .post(`/toon/2/favorite`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.TOON_NOT_FOUND.message);
        })
  });

});
