import axios, {AxiosResponse} from 'axios';
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../util/genre.to.enum";
import {ToonDto} from "../../toon/dto/toon.dto";
import {SyncResult} from "../../toon/interface/interface.syncresult";
import {ToonUpdate} from "../../toon/interface/interface.toon.update";
import {findExistsToons} from "../../util/find.exists.toons";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const COMMON_HEADERS = {
  'Accept-Language': 'ko',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  'Referer': 'https://page.kakao.com/',
  'Origin': 'https://page.kakao.com',
};

const genres =
    ["무협", "로맨스", "스릴러",
      "액션", "일상", "개그",
      "판타지", "드라마", "스포츠",
      "감성", "로판", "로맨스 판타지"];

async function fetchWebtoonData(day: string): Promise<SyncResult> {
  const url = `https://gateway-kw.kakao.com/section/v2/timetables/days?placement=timetable_${day}`;
  const existingToons = await findExistsToons(ToonProvider.NAVER);

  let createData: ToonDto[] = [];
  let updateData: ToonUpdate[] = [];
  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: COMMON_HEADERS
    });
    const resultData = response.data.data[0].cardGroups[0].cards.slice(0, 10);
    for (const item of resultData) {
      const platformId = item.content.id;

      try {
        const totalEpisode: any = await fetchLatestEpisodeData(platformId);
        const summary: any = await fetchSummaryData(platformId);
        const title =  item.content.title;
        const findToon = existingToons.find(toon => toon.platformId === platformId);

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
        }else{
          const webtoon = {
            platformId,
            provider: ToonProvider.KAKAO_W,
            title: item.content.title,
            authors: item.content.authors.map(author => author.name).join(', '),
            status: item.content.badges.find(badge =>
                badge.title === 'EPISODES_NOT_PUBLISHING') !== undefined ? ToonStatus.PAUSED : day === 'completed' ? ToonStatus.FINISHED : ToonStatus.ONGOING,
            isAdult: item.content.adult,
            publishDays: day,
            imageUrl: `${item.content.featuredCharacterImageB}.png`,
            pageUrl: `https://webtoon.kakao.com/content/${item.content.seoId}/${platformId}`,
            summary: summary ? summary.summary : null,
            genre: summary ? summary.genre : null,
            totalEpisode: totalEpisode,
          } as ToonDto

          createData.push(webtoon);
        }
        console.log(`✅ 수집 중: ${item.content.title}`);

      } catch (e) {
        console.error(`❌ [ID: ${platformId}] 상세 정보 수집 실패: ${e.message}`);
        await sleep(500);
      }
    }
    return {
      createData,
      updateData
    };

  } catch (error: any) {
    console.error(`\n🚨 [${day}] 목록 요청 실패: ${error.message}`);
    return {
      createData: [],
      updateData: []
    };
  }
}

async function fetchLatestEpisodeData(id: number): Promise<string | null> {
  const url = `https://gateway-kw.kakao.com/episode/v2/views/content-home/contents/${id}/episodes?sort=-NO&offset=0&limit=1`;

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: COMMON_HEADERS
    });
    return response.data.data.episodes[0].no;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`HTTP 요청 실패: ${error.response.status} - ${error.message}`);
    } else {
      console.error(`데이터 요청 실패: ${error.message}`);
    }
    return null;
  }
}


async function fetchSummaryData(id: number): Promise<any> {
  const url = `https://gateway-kw.kakao.com/decorator/v2/decorator/contents/${id}/profile`;

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: COMMON_HEADERS
    });
    const resultData = response.data.data;
    const genre = genres.find(genreB =>
        resultData.seoKeywords.some(genreA => genreA.includes(genreB))
    );

    return {
      summary: resultData.synopsis.replace(/\n/g, ' ').replace('  ', ' '),
      genre: genre ? mapGenreToEnum(genre) : null
    };

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`HTTP 요청 실패: ${error.response.status} - ${error.message}`);
    } else {
      console.error(`데이터 요청 실패: ${error.message}`);
    }
    return null;
  }
}

export async function getKakaoWFinishedToons(): Promise<SyncResult> {
  console.log("카카오 웹툰 데이터 수집 시작");
  const startTime = Date.now();
  const result = await fetchWebtoonData('complete')
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`카카오 웹툰 수집 완료 - 갯수 ${result.createData.length + result.updateData.length}개, 소요 시간: ${duration}초`);
  return result;
}