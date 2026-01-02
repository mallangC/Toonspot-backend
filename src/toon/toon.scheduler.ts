import {Injectable, Logger} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {ToonRepository} from "./toon.repository";
import {getNaverFinishedToons} from "../api/finish/sync.finished.naver";
import {getKakaoWFinishedToons} from "../api/finish/sync.finished.kakao.w";
import {getKakaoPFinishedToons} from "../api/finish/sync.finished.kakao.p";
import {ToonDto} from "./dto/toon.dto";
import {getNaverDailyToons} from "../api/daily/sync.daily.naver";
import {ToonUpdate} from "./interface/interface.toon.update";
import {getKakaoWDailyToons} from "../api/daily/sync.daily.kakao.w";
import {getKakaoPDailyToons} from "../api/daily/sync.daily.kakao.p";

@Injectable()
export class ToonScheduler {
  private readonly logger = new Logger(ToonScheduler.name);

  constructor(private readonly toonRepository: ToonRepository) {
  }

  // 매주 월요일 오전 2시 실행에 실행되는 작업 (주간 데이터 수집)
  @Cron('0 0 2 * * 1')
  async handleWeeklyWebtoonCrawl() {
    this.logger.log(`[주간 데이터 수집] 작업 시작: ${new Date().toLocaleString()}`);

    try {
      const updateAll: ToonUpdate[] = [];
      const createAll: ToonDto[] = [];
      const resultNaver = await getNaverFinishedToons(false);
      const resultKakaoW = await getKakaoWFinishedToons();
      const resultKakaoP = await getKakaoPFinishedToons();

      updateAll.push(...resultNaver.updateData);
      updateAll.push(...resultKakaoW.updateData);
      updateAll.push(...resultKakaoP.updateData);
      createAll.push(...resultNaver.createData);
      createAll.push(...resultKakaoW.createData);
      createAll.push(...resultKakaoP.createData);

      this.toonRepository.saveAll(createAll);
      await this.toonRepository.updateAll(updateAll);
      this.logger.log(`[주간 데이터 수집] 작업 완료: ${new Date().toLocaleString()}`);

    } catch (error) {
      this.logger.error('[주간 데이터 수집] 작업 실패:', error.message);
    }
  }

  // 매일 업데이트할 월~일, 매일+ 데이터 수집
  @Cron('0 0 0 * * *')
  async handleTestJob() {
    this.logger.debug(`[일간 데이터 수집] 작업 시작: ${new Date().toLocaleString()}`);
    const createData: ToonDto[] = [];
    const updateData: ToonUpdate[] = [];
    const resultNaver = await getNaverDailyToons();
    const resultKakaoW = await getKakaoWDailyToons();
    const resultKakaoP = await getKakaoPDailyToons();
    createData.push(...resultNaver.createData);
    updateData.push(...resultNaver.updateData);
    createData.push(...resultKakaoW.createData);
    updateData.push(...resultKakaoW.updateData);
    createData.push(...resultKakaoP.createData);
    updateData.push(...resultKakaoP.updateData);
    await this.toonRepository.saveAll(createData);
    await this.toonRepository.updateAll(updateData);
    this.logger.log(`[일간 데이터 수집] 작업 성공: ${new Date().toLocaleString()}`)
  }
}