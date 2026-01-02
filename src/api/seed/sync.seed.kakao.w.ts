import axios, {AxiosResponse} from 'axios';
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../util/genre.to.enum";
import {ToonDto} from "../../toon/dto/toon.dto";
import {mergeSeedToons} from "../../util/merge.seed.toons";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const genres =
    ["무협", "로맨스", "스릴러",
      "액션", "일상", "개그",
      "판타지", "드라마", "스포츠",
      "감성", "로판", "로맨스 판타지"];

async function fetchWebtoonData(day: string): Promise<ToonDto[]> {
  const url = `https://gateway-kw.kakao.com/section/v2/timetables/days?placement=timetable_${day}`;
  const collectedData: any[] = [];
  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept-Language': 'ko',
      }
    });

    const resultData = response.data.data[0].cardGroups[0].cards;
    for (const item of resultData) {
      const toonId = item.content.id;
      try {
        const totalEpisode: any = await fetchLatestEpisodeData(toonId);
        const summary: any = await fetchSummaryData(toonId);

        const webtoon = {
          toonId,
          provider: ToonProvider.KAKAO_W,
          title: item.content.title,
          authors: item.content.authors.map(author => author.name).join(', '),
          status: item.content.badges.find(badge =>
              badge.title === 'EPISODES_NOT_PUBLISHING') !== undefined ? ToonStatus.PAUSED : day === 'completed' ? ToonStatus.FINISHED : ToonStatus.ONGOING,
          isAdult: item.content.adult,
          publishDays: day,
          imageUrl: `${item.content.featuredCharacterImageB}.png`,
          pageUrl: `https://webtoon.kakao.com/content/${item.content.seoId}/${toonId}`,
          summary: summary ? summary.summary : null,
          genre: summary ? summary.genre : null,
          totalEpisode,
          isActive: true
        } as ToonDto

        collectedData.push(webtoon);
        console.log(`✅ 수집 중: ${item.content.title}`);

      } catch (e) {
        console.error(`❌ [ID: ${toonId}] 상세 정보 수집 실패: ${e.message}`);
        await sleep(500); // 에러 발생 시 조금 더 길게 휴식
      }
    }
    return collectedData;

  } catch (error: any) {
    console.error(`\n🚨 [${day}] 목록 요청 실패: ${error.message}`);
    return [];
  }
}

async function fetchLatestEpisodeData(id: number): Promise<string | null> {
  const url = `https://gateway-kw.kakao.com/episode/v2/views/content-home/contents/${id}/episodes?sort=-NO&offset=0&limit=1`;

  try {
    const response: AxiosResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept-Language': 'ko',
      }
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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept-Language': 'ko',
      }
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

export async function getKakaoWToos(): Promise<ToonDto[]> {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'complete'];
  // const days = ['mon', 'tue', 'wed'];

  console.log("카카오 웹툰 데이터 수집 시작");
  const startTime = Date.now();
  const result: ToonDto[] = await mergeSeedToons(days, fetchWebtoonData)
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`카카오 웹툰 수집 완료 - 갯수 ${result.length}개, 소요 시간: ${duration}초`);
  return result;
}