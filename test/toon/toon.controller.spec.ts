import {Test, TestingModule} from '@nestjs/testing';
import {PrismaService} from "../../prisma/prisma.service";
import {AppModule} from "../../src/app.module";
import {JwtAuthGuard} from "../../src/auth/jwt/jwt.guard";
import {MockAuthGuard} from "../mocks/mock-auth.guard";
import {INestApplication, ValidationPipe} from "@nestjs/common";
import {Role} from "../../src/type/user.type";
import {ToonGenre, ToonProvider, ToonStatus, UserStatus} from "@prisma/client";
import {ToonCreateDto} from "../../src/toon/dto/toon.create.dto";
import request from "supertest";
import {ExceptionCode} from "../../src/exception/exception.code";
import {ToonUpdateDto} from "../../src/toon/dto/toon.update.dto";
import {ToonActiveDto} from "../../src/toon/dto/toon.active.dto";
import {CACHE_MANAGER} from "@nestjs/cache-manager";

describe('ToonController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cacheManager: Cache;

  const createDto = {
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

  const createDtoList = [
    {
      toonId: 1,
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
      isActive: true
    }, {
      toonId: 2,
      provider: ToonProvider.KAKAO_W,
      title: '테스트 웹툰2',
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
      isActive: false
    }, {
      toonId: 3,
      provider: ToonProvider.KAKAO_P,
      title: '테스트 웹툰3',
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
      isActive: true
    },
  ];

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
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트'
    }
    await prisma.user.create({data: {...userData, role: Role.ADMIN, status: UserStatus.ACTIVE, verificationToken: 'token'}});
  });

  beforeEach(async () => {
    await prisma.toon.deleteMany();
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: Role.ADMIN};
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.toon.deleteMany();
    const store = (cacheManager as any).store;
    if (store.client) {
      await store.client.quit();
    }
    await app.close();
  });

  it('POST /toon : 툰 등록 성공', () => {
    return request(app.getHttpServer())
        .post('/toon')
        .send(createDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.toonId).toEqual(createDto.toonId);
          expect(res.body.data.provider).toEqual(createDto.provider);
          expect(res.body.data.title).toEqual(createDto.title);
          expect(res.body.data.authors).toEqual(createDto.authors);
          expect(res.body.data.summary).toEqual(createDto.summary);
          expect(res.body.data.genre).toEqual(createDto.genre);
          expect(res.body.data.rating).toEqual(createDto.rating);
          expect(res.body.data.status).toEqual(createDto.status);
          expect(res.body.data.isAdult).toEqual(createDto.isAdult);
          expect(res.body.data.imageUrl).toEqual(createDto.imageUrl);
          expect(res.body.data.pageUrl).toEqual(createDto.pageUrl);
          expect(res.body.data.totalEpisode).toEqual(createDto.totalEpisode);
          expect(res.body.data.publishDays).toEqual(createDto.publishDays);
        })
  });

  it('POST /toon : 툰 등록 실패 (권한이 다름)', () => {
    MockAuthGuard.mockUser = {email: 'test@email.com', name: '김테스트', role: Role.USER};
    return request(app.getHttpServer())
        .post('/toon')
        .send(createDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.UNAUTHORIZED.message);
        })
  });

  it('POST /toon : 툰 등록 실패', async () => {
    await prisma.toon.create({data: createDto});

    return request(app.getHttpServer())
        .post('/toon')
        .send(createDto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.TOON_ALREADY_EXISTS.message);
        })
  });

  it('GET /toon/:id : 툰 단일 조회 성공', async () => {
    const dto = {
      id: 100,
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
    };
    await prisma.toon.create({data: dto});
    return request(app.getHttpServer())
        .get(`/toon/${dto.id}`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.id).toEqual(dto.id);
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

  it('GET /toon/:id : 툰 단일 조회 실패 (isActive=false)', async () => {
    const dto = {
      id: 100,
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
    };
    await prisma.toon.create({data: {...dto, isActive: false}});
    return request(app.getHttpServer())
        .get(`/toon/${dto.id}`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.TOON_NOT_FOUND.message);
        })
  });

  it('GET /toon/admin/:id : 툰 단일 조회 성공 (관리자)', async () => {
    const dto = {
      id: 100,
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
    };
    await prisma.toon.create({data: {...dto, isActive: false}});
    return request(app.getHttpServer())
        .get(`/toon/admin/${dto.id}`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.id).toEqual(dto.id);
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

  it('GET /toon?page=1 : 툰 페이징 조회 성공', async () => {
    await prisma.toon.createMany({data: createDtoList});
    return request(app.getHttpServer())
        .get(`/toon?page=1`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(2);
        })
  });

  it('GET /toon?page=1&provider=NAVER : 툰 페이징 조회 성공 (Naver 웹툰만)', async () => {
    await prisma.toon.createMany({data: createDtoList});
    return request(app.getHttpServer())
        .get(`/toon?page=1&provider=NAVER`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(1);
        })
  });

  it('GET /toon?page=1&sortBy=desc : 툰 페이징 조회 성공 (내림차순)', async () => {
    await prisma.toon.createMany({data: createDtoList});
    return request(app.getHttpServer())
        .get(`/toon?page=1&order=desc`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(2);
        })
  });

  it('GET /toon/admin?page=1 : 툰 페이징 조회 성공 (관리자)', async () => {

    await prisma.toon.createMany({data: createDtoList});
    return request(app.getHttpServer())
        .get(`/toon/admin?page=1`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.items.length).toEqual(3);
        })
  });


  it('PATCH /toon : 툰 수정 성공', async () => {
    await prisma.toon.create({data: {...createDto, id: 100}});
    const dto = {
      id: 100,
      toonId: 1234,
      title: '수정된 웹툰제목',
      authors: '수정된 저자',
      summary: '수정된 줄거리',
      genre: ToonGenre.ACTION,
      rating: 9.9,
      status: ToonStatus.ONGOING,
      isAdult: true,
      imageUrl: 'https://image.com/image.jpg.update',
      pageUrl: 'https://toon.com/12341234/update',
      totalEpisode: 20,
      publishDays: '수정된 요일',
      provider: ToonProvider.NAVER
    }as ToonUpdateDto

    return request(app.getHttpServer())
        .patch('/toon')
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

  it('PATCH /toon : 툰 수정 실패 (바꾸려는 toonId + provider 조합이 이미 존재함)', async () => {
    await prisma.toon.create({data: {...createDto, id: 100}});
    await prisma.toon.create({data: {...createDto,toonId: 1212, id: 150}});
    const dto = {
      id: 100,
      toonId: 1212,
      title: '수정된 웹툰제목',
      authors: '수정된 저자',
      summary: '수정된 줄거리',
      genre: ToonGenre.ACTION,
      rating: 9.9,
      status: ToonStatus.ONGOING,
      isAdult: true,
      imageUrl: 'https://image.com/image.jpg.update',
      pageUrl: 'https://toon.com/12341234/update',
      totalEpisode: 20,
      publishDays: '수정된 요일',
      provider: ToonProvider.NAVER
    }as ToonUpdateDto

    return request(app.getHttpServer())
        .patch('/toon')
        .send(dto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.message).toEqual(ExceptionCode.TOON_ALREADY_EXISTS.message);
        })
  });

  it('PATCH /toon/active : 툰 비활성화 성공', async () => {
    await prisma.toon.create({data: {...createDto, id: 100}});
    const dto = {
      id: 100,
      isActive: false
    }as ToonActiveDto

    return request(app.getHttpServer())
        .patch('/toon/active')
        .send(dto)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data.id).toEqual(dto.id);
          expect(res.body.data.isActive).toEqual(dto.isActive);
        })
  });

  it('DELETE /toon/:id : 툰 비활성화 성공', async () => {
    await prisma.toon.create({data: {...createDto, id: 100}});
    return request(app.getHttpServer())
        .delete(`/toon/100`)
        .expect(res => {
          console.log(JSON.stringify(res.body, null, 2));
          expect(res.body.data).toEqual('100번 웹툰이 삭제되었습니다.');
        })
  });

});
