import {PrismaClient} from "@prisma/client";
import {getNaverWebtoons} from "../src/middlewares/sync/seed/sync.seed.naver";
import {getKakaoWToos} from "../src/middlewares/sync/seed/sync.seed.kakao.w";
import {getKakaoPToons} from "../src/middlewares/sync/seed/sync.seed.kakao.p";
import {ToonDto} from "../src/toon/dto/toon.dto";
import {getNaverFinishedToons} from "../src/middlewares/sync/finish/sync.finished.naver";
import {SyncResult} from "../src/toon/interface/interface.syncresult";

const prisma = new PrismaClient();

async function main() {
  const startTime = new Date();
  const naverData: ToonDto[] = await getNaverWebtoons();
  await prisma.toon.createMany({data: naverData, skipDuplicates: true});
  const naverFinishData: SyncResult = await getNaverFinishedToons(true);
  await prisma.toon.createMany({data: naverFinishData.createData, skipDuplicates: true});
  console.log('Naver 데이터 시딩 완료');
  const kakaoWData: ToonDto[] = await getKakaoWToos();
  await prisma.toon.createMany({data: kakaoWData, skipDuplicates: true});
  console.log('KakaoW 데이터 시딩 완료');
  const kakaoWTitles = new Set<string>(kakaoWData.map(t => t.title));
  const kakaoPDataRaw: ToonDto[] = await getKakaoPToons();
  const kakaoPData = kakaoPDataRaw.filter(t => !kakaoWTitles.has(t.title));
  await prisma.toon.createMany({data: kakaoPData, skipDuplicates: true});
  console.log('KakaoP 데이터 시딩 완료');
  const endTime = new Date();
  console.log(`전체 시딩 완료. (${((endTime.getTime() - startTime.getTime()) / 1000).toFixed(1)}초)`);
}

main()
    .catch((e) => {
      console.error('❌ 시딩 중 오류 발생:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('Prisma 연결 해제.');
    });