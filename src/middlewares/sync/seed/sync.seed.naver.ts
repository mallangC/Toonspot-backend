import axios, {AxiosResponse} from "axios";
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../genre.to.enum";
import {ToonDto} from "../../../toon/dto/toon.dto";

const COMMON_HEADERS = {
  'Accept-Language': 'ko',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
};

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

async function fetchWebtoonData(day: string): Promise<ToonDto[]> {
  const url = `https://comic.naver.com/api/webtoon/titlelist/weekday?week=${day}&order=user`;
  const collectedData: ToonDto[] = [];

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: COMMON_HEADERS
    });

    const titleList = response.data.titleList;
    console.log(`\n📅 [${day}] 데이터 수집 시작 - 총 ${titleList.length}개 발견`);

    for (const item of titleList) {
      const toonId = item.titleId;

      try {
        let info: any = null;
        let totalCount: number | null = null;

        console.log(`✅ 수집 중: ${item.titleName}`);
        const isAdult = item.adult;
        info = await fetchWebtoonDataInfo(toonId);
        if (!isAdult) {
          totalCount = await fetchWebtoonDataTotalCount(toonId);
        }

        const webtoon = {
          toonId,
          provider: ToonProvider.NAVER,
          title: item.titleName,
          authors: item.author.replaceAll(' / ', ', '),
          status: item.rest === true ? ToonStatus.PAUSED : item.finish === true ? ToonStatus.FINISHED : ToonStatus.ONGOING,
          isAdult,
          publishDays: info.publishDays,
          rating: Number(item.starScore.toFixed(1)),
          imageUrl: item.thumbnailUrl,
          pageUrl: `https://comic.naver.com/webtoon/list?titleId=${toonId}`,
          summary: info ? info.summary : null,
          genre: info ? info.genre : null,
          totalEpisode: totalCount,
          isActive: true
        } as ToonDto;
        collectedData.push(webtoon);

      } catch (e) {
        console.error(`  ❌ [ID: ${toonId}] 상세 정보 수집 실패: ${e.message}`);
      }
    }

    return collectedData;

  } catch (error: any) {
    console.error(`🚨 [${day}] 목록 요청 실패: ${error.message}`);
    return [];
  }
}

export async function getNaverWebtoons(): Promise<ToonDto[]> {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'dailyPlus'];
  // const days = ['mon', 'tue', 'wed'];

  console.log("네이버 웹툰 데이터 수집 시작");
  const startTime = Date.now();
  let resultAll: ToonDto[] = [];
  for (const day of days) {
    const result = await fetchWebtoonData(day)
    resultAll.push(...result);
  }
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`네이버 웹툰 수집 완료 - 갯수 ${resultAll.length}개, 소요 시간: ${duration}초`);
  return resultAll;
}