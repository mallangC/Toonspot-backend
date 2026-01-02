import axios, {AxiosResponse} from "axios";
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../genre.to.enum";
import {ToonDto} from "../../../toon/dto/toon.dto";
import {SyncResult} from "../../../toon/interface/interface.syncresult";
import {ToonUpdate} from "../../../toon/interface/interface.toon.update";
import {findExistsToons} from "../../find.exists.toons";

const COMMON_HEADERS = {
  'Accept-Language': 'ko',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
};


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWebtoonDataInfo(id: number | string): Promise<any> {
  const url = `https://comic.naver.com/api/article/list/info?titleId=${id}`;
  const response: AxiosResponse = await axios.get(url, {
    headers: COMMON_HEADERS
  });

  const resultData = response.data;
  const weekday = resultData.gfpAdCustomParam.weekdays;

  return {
    summary: resultData.synopsis ? resultData.synopsis
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, "")
        .replace(/\n/g, ' ')
        .replace(/\s\s+/g, ' ') : null,
    genre: resultData.curationTagList && resultData.curationTagList.length > 0
        ? mapGenreToEnum(resultData.curationTagList[0].tagName)
        : null,
    publishDays: weekday.join(', ')
  };
}

async function fetchWebtoonDataTotalCount(id: number | string): Promise<number> {
  const url = `https://comic.naver.com/api/article/list?titleId=${id}&page=1`;
  const response: AxiosResponse = await axios.get(url, {
    headers: COMMON_HEADERS
  });
  return response.data.totalCount;
}

async function syncWebtoonData(day: string): Promise<SyncResult> {
  const url = `https://comic.naver.com/api/webtoon/titlelist/weekday?week=${day}&order=user`;
  const existingToons = await findExistsToons(ToonProvider.NAVER);

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: COMMON_HEADERS
    });

    const createData: ToonDto[] = [];
    const updateData: ToonUpdate[] = [];

    const titleList = response.data.titleList;
    console.log(`\n📅 [${day}] 데이터 수집 시작 - 총 ${titleList.length}개 발견`);

    for (const item of titleList) {
      const toonId = item.titleId;

      try {
        let info: any = null;
        let totalEpisode: number | null = null;

        const isAdult = item.adult;
        info = await fetchWebtoonDataInfo(toonId);
        if (!isAdult) {
          totalEpisode = await fetchWebtoonDataTotalCount(toonId);
        }

        const status = item.rest === true ? ToonStatus.PAUSED : item.finish === true ? ToonStatus.FINISHED : ToonStatus.ONGOING;
        const title = item.titleName;

        const findToon = existingToons.find(toon => toon.toonId === toonId);
        if (findToon) {
          if (findToon.status !== status || findToon.totalEpisode !== totalEpisode) {
            console.log(`업데이트 : ${title}`);
            const webtoon = {
              toonId,
              title,
              status,
              publishDays: status === ToonStatus.FINISHED ? '완결' : info.publishDays,
              rating: Number(item.starScore.toFixed(1)),
              totalEpisode,
              provider: ToonProvider.NAVER,
            } as ToonUpdate;

            updateData.push(webtoon);
          }
        } else {
          console.log(`추가 : ${title}`);
          const webtoon = {
            toonId,
            provider: ToonProvider.NAVER,
            title,
            authors: item.author.replaceAll(' / ', ', '),
            status,
            isAdult,
            publishDays: info.publishDays,
            rating: Number(item.starScore.toFixed(1)),
            imageUrl: item.thumbnailUrl,
            pageUrl: `https://comic.naver.com/webtoon/list?titleId=${toonId}`,
            summary: info ? info.summary : null,
            genre: info ? info.genre : null,
            totalEpisode,
            isActive: true
          } as ToonDto;

          createData.push(webtoon);
        }
      } catch (e) {
        console.error(`  ❌ [ID: ${toonId}] 상세 정보 수집 실패: ${e.message}`);
        await sleep(500);
      }
    }

    return {
      createData,
      updateData
    };

  } catch (error: any) {
    console.error(`🚨 [${day}] 목록 요청 실패: ${error.message}`);
    return {
      createData: [],
      updateData: []
    };
  }
}

export async function getNaverDailyToons(): Promise<SyncResult> {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'dailyPlus'];
  // const days = ['mon'];

  console.log("[데일리] 네이버 웹툰 데이터 수집 시작");
  const startTime = Date.now();
  const resultAll: SyncResult = {
    createData: [],
    updateData: []
  };
  for (const day of days) {
    const result = await syncWebtoonData(day)
    resultAll.createData.push(...result.createData);
    resultAll.updateData.push(...result.updateData);
  }
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`네이버 웹툰 수집 완료 - 갯수 ${resultAll.createData.length + resultAll.updateData.length}개, 소요 시간: ${duration}초`);
  return resultAll;
}