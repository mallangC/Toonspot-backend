import axios, {AxiosResponse} from "axios";
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../util/genre.to.enum";
import {ToonDto} from "../../toon/dto/toon.dto";
import {SyncResult} from "../../toon/interface/interface.syncresult";
import {ToonUpdate} from "../../toon/interface/interface.toon.update";
import {findExistsToons} from "../../util/find.exists.toons";

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

async function fetchWebtoonData(isSeed: boolean): Promise<SyncResult> {
  const titleList: any[] = [];
  const latest = isSeed ? '' : '최신';
  let num = 1;
  const existingToons = await findExistsToons(ToonProvider.NAVER);

  const createData: ToonDto[] = [];
  const updateData: ToonUpdate[] = [];

  try {
    while (true) {
      const url = `https://comic.naver.com/api/webtoon/titlelist/finished?page=${num}&order=UPDATE`;
      const response: AxiosResponse = await axios.get(url, {
        headers: COMMON_HEADERS
      });
      if (!isSeed) {
        titleList.push(response.data.titleList.slice(0, 10));
        break;
      }
      titleList.push(...response.data.titleList);
      if (num > response.data.pageInfo.lastPage) {
        break
      }
      num++;
    }
    console.log(`[${latest}완결] 데이터 수집 시작 - 총 ${titleList.length}개 발견`);

    for (const item of titleList) {
      const platformId = item.titleId;

      try {
        let info: any = null;
        let totalEpisode: number | null = null;

        console.log(`✅ 수집 중: ${item.titleName}`);
        const isAdult = item.adult;
        info = await fetchWebtoonDataInfo(platformId);
        if (!isAdult) {
          totalEpisode = await fetchWebtoonDataTotalCount(platformId);
        }
        const title = item.titleName;
        const findToon = existingToons.find(toon => toon.platformId === platformId);
        console.log(`${findToon ? '업데이트' : '추가'} 중: ${title}`);

        if (findToon) {
          if (findToon.status !== ToonStatus.FINISHED || findToon.totalEpisode !== totalEpisode) {
            const webtoon = {
              platformId,
              title,
              status: ToonStatus.FINISHED,
              publishDays: '완결',
              rating: Number(item.starScore.toFixed(1)),
              totalEpisode,
              provider: ToonProvider.NAVER,
            } as ToonUpdate;

            updateData.push(webtoon);
          }
        } else {
          const webtoon = {
            platformId,
            provider: ToonProvider.NAVER,
            title: item.titleName,
            authors: item.author.replaceAll(' / ', ', '),
            status: ToonStatus.FINISHED,
            isAdult,
            publishDays: '완결',
            rating: Number(item.starScore.toFixed(1)),
            imageUrl: item.thumbnailUrl,
            pageUrl: `https://comic.naver.com/webtoon/list?titleId=${platformId}`,
            summary: info ? info.summary : null,
            genre: info ? info.genre : null,
            totalEpisode,
            isActive: true
          } as ToonDto;

          createData.push(webtoon);
        }

      } catch (e) {
        console.error(`[ID: ${platformId}] 상세 정보 수집 실패: ${e.message}`);
      }
    }

    return {
      createData,
      updateData
    };

  } catch (error: any) {
    console.error(`[${latest}완결] 목록 요청 실패: ${error.message}`);
    return {
      createData: [],
      updateData: []
    };
  }
}

export async function getNaverFinishedToons(isSeed: boolean): Promise<SyncResult> {
  console.log("[완결] 네이버 웹툰 데이터 수집 시작");
  const latest = isSeed ? '' : '최신';
  const startTime = Date.now();
  const result = await fetchWebtoonData(isSeed)
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`[${latest}완결] 네이버 웹툰 수집 완료 - 갯수 ${result.createData.length + result.updateData.length}개, 소요 시간: ${duration}초`);
  return result;
}