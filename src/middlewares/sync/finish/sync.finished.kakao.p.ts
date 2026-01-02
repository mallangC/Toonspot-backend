import axios from "axios";
import {ToonProvider, ToonStatus} from "@prisma/client";
import {mapGenreToEnum} from "../../genre.to.enum";
import {ToonDto} from "../../../toon/dto/toon.dto";
import {SyncResult} from "../../../toon/interface/interface.syncresult";
import {ToonUpdate} from "../../../toon/interface/interface.toon.update";
import {findExistsToons} from "../../find.exists.toons";

const GRAPHQL_ENDPOINT = 'https://bff-page.kakao.com/graphql';

const COMMON_HEADERS = {
  'Accept-Language': 'ko',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  'Referer': 'https://page.kakao.com/',
  'Origin': 'https://page.kakao.com',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllPages(dayTabUid: string) {
  let allItems: any[] = [];
  let currentPage = 1;
  let isEnd = false;

  const FULL_QUERY = `
  query staticLandingDayOfWeekSection($sectionId: ID!, $param: StaticLandingDayOfWeekParamInput!) {
  staticLandingDayOfWeekSection(sectionId: $sectionId, param: $param) {
    ...Section
  }
}

fragment Section on Section {
  __typename
  id
  uid
  type
  title
  ... on StaticLandingDayOfWeekSection {
    isEnd
    totalCount
    param {
      categoryUid
      page
      size
      screenUid
    }
    groups {
      ...Group
    }
  }
  ... on StaticLandingRankingSection {
    isEnd
    totalCount
    groups {
      ...Group
    }
  }
}

fragment Group on Group {
  __typename
  id
  type
  ... on ListViewGroup {
    meta {
      title
      count
    }
  }
  ... on CardViewGroup {
    meta {
      title
      count
    }
  }
  ... on PosterViewGroup {
    meta {
      title
      count
    }
  }
  items {
    ...Item
  }
}

fragment Item on Item {
  __typename
  id
  type
  ...PosterViewItem
  ...CardViewItem
  ...NormalListViewItem
  ... on DisplayAdItem {
    displayAd {
      sectionUid
      bannerUid
    }
  }
}

fragment PosterViewItem on PosterViewItem {
  id
  title
  thumbnail
  ageGrade
  scheme
  seriesId
  eventLog {
    ...EventLogFragment
  }
}

fragment CardViewItem on CardViewItem {
  id
  title
  thumbnail
  ageGrade
  scheme
  eventLog {
    ...EventLogFragment
  }
}

fragment NormalListViewItem on NormalListViewItem {
  id
  seriesId
  thumbnail
  ageGrade
  scheme
  eventLog {
    ...EventLogFragment
  }
}

fragment EventLogFragment on EventLog {
  eventMeta {
    id
    name
    subcategory
    category
    series_id
    provider
  }
}
  `;

  while (!isEnd) {
    const payload = {
      operationName: "staticLandingDayOfWeekSection",
      query: FULL_QUERY,
      variables: {
        param: {
          bmType: "A",
          categoryUid: 10,
          dayTabUid: dayTabUid,
          page: currentPage,
          screenUid: 52,
          subcategoryUid: "0",
        },
        sectionId: `static-landing-DayOfWeek-section-Layout-10-0-A-${dayTabUid}-52`,
      }
    };

    try {
      const response = await axios.post(GRAPHQL_ENDPOINT, payload, {headers: COMMON_HEADERS});
      const sectionData = response.data.data.staticLandingDayOfWeekSection;
      const items = sectionData.groups[0].items;
      allItems.push(...items);

      isEnd = sectionData.isEnd;
      if (!isEnd) {
        currentPage++;
        await sleep(100);
      }

    } catch (e) {
      console.error(`❌ ${currentPage}페이지 수집 실패:`, e.message);
      break;
    }
  }

  return allItems;
}

async function fetchWebtoonData(dayNum: string): Promise<SyncResult> {
  const inputVariables = {
    queryInput: {
      categoryUid: 10,
      dayTabUid: dayNum,
      type: "Layout",
      screenUid: 52
    }
  };

  const fullQuery = ` 
    query staticLandingDayOfWeekLayout($queryInput: StaticLandingDayOfWeekParamInput!) {
  staticLandingDayOfWeekLayout(input: $queryInput) {
    ...Layout
  }
}
    
    fragment Layout on Layout {
  id
  type
  sections {
    ...Section
  }
  screenUid
}
    

    fragment Section on Section {
  id
  uid
  type
  title
  ... on RecommendSection {
    isRecommendArea
    isRecommendedItems
  }
  ... on DependOnLoggedInSection {
    loggedInTitle
    loggedInScheme
  }
  ... on SchemeSection {
    scheme
  }
  ... on MetaInfoTypeSection {
    metaInfoType
  }
  ... on TabSection {
    sectionMainTabList {
      uid
      title
      isSelected
      scheme
      additionalString
      subTabList {
        uid
        title
        isSelected
        groupId
      }
    }
  }
  ... on ThemeKeywordSection {
    themeKeywordList {
      uid
      title
      scheme
    }
  }
  ... on StaticLandingDayOfWeekSection {
    isEnd
    totalCount
    param {
      categoryUid
      businessModel {
        name
        param
      }
      subcategory {
        name
        param
      }
      dayTab {
        name
        param
      }
      page
      size
      screenUid
    }
    businessModelList {
      name
      param
    }
    subcategoryList {
      name
      param
    }
    dayTabList {
      name
      param
    }
    promotionBanner {
      ...PromotionBannerItem
    }
  }
  ... on StaticLandingTodayNewSection {
    totalCount
    param {
      categoryUid
      subcategory {
        name
        param
      }
      screenUid
    }
    categoryTabList {
      name
      param
    }
    subcategoryList {
      name
      param
    }
    promotionBanner {
      ...PromotionBannerItem
    }
    viewType
  }
  ... on StaticLandingTodayUpSection {
    isEnd
    totalCount
    param {
      categoryUid
      subcategory {
        name
        param
      }
      page
    }
    categoryTabList {
      name
      param
    }
    subcategoryList {
      name
      param
    }
  }
  ... on StaticLandingRankingSection {
    isEnd
    rankingTime
    totalCount
    param {
      categoryUid
      subcategory {
        name
        param
      }
      rankingType {
        name
        param
      }
      page
      screenUid
    }
    categoryTabList {
      name
      param
    }
    subcategoryList {
      name
      param
    }
    rankingTypeList {
      name
      param
    }
    displayAd {
      ...DisplayAd
    }
    promotionBanner {
      ...PromotionBannerItem
    }
    withOperationArea
    viewType
  }
  ... on StaticLandingGenreSection {
    isEnd
    totalCount
    param {
      categoryUid
      subcategory {
        name
        param
      }
      sortType {
        name
        param
      }
      page
      isComplete
      screenUid
    }
    subcategoryList {
      name
      param
    }
    sortTypeList {
      name
      param
    }
    displayAd {
      ...DisplayAd
    }
    promotionBanner {
      ...PromotionBannerItem
    }
  }
  ... on StaticLandingFreeSeriesSection {
    isEnd
    totalCount
    param {
      categoryUid
      tab {
        name
        param
      }
      page
      screenUid
    }
    tabList {
      name
      param
    }
    promotionBanner {
      ...PromotionBannerItem
    }
  }
  ... on StaticLandingEventSection {
    isEnd
    totalCount
    param {
      categoryUid
      page
    }
    categoryTabList {
      name
      param
    }
  }
  ... on StaticLandingOriginalSection {
    isEnd
    totalCount
    originalCount
    param {
      categoryUid
      subcategory {
        name
        param
      }
      sortType {
        name
        param
      }
      isComplete
      page
      screenUid
    }
    subcategoryList {
      name
      param
    }
    sortTypeList {
      name
      param
    }
    recommendItemList {
      ...Item
    }
  }
  ... on HelixThemeSection {
    subtitle
    isRecommendArea
  }
  groups {
    ...Group
  }
}
    

    fragment PromotionBannerItem on PromotionBannerItem {
  title
  scheme
  leftImage
  rightImage
  eventLog {
    ...EventLogFragment
  }
}
    

    fragment EventLogFragment on EventLog {
  fromGraphql
  click {
    layer1
    layer2
    setnum
    ordnum
    copy
    imp_id
    imp_provider
  }
  eventMeta {
    id
    name
    subcategory
    category
    series
    provider
    series_id
    type
  }
  viewimp_contents {
    type
    name
    id
    imp_area_ordnum
    imp_id
    imp_provider
    imp_type
    layer1
    layer2
  }
  customProps {
    landing_path
    view_type
    helix_id
    helix_yn
    helix_seed
    content_cnt
    event_series_id
    event_ticket_type
    play_url
    banner_uid
  }
}
    

    fragment DisplayAd on DisplayAd {
  sectionUid
  bannerUid
  treviUid
  momentUid
}
    

    fragment Item on Item {
  id
  type
  ...BannerItem
  ...OnAirItem
  ...CardViewItem
  ...CleanViewItem
  ... on DisplayAdItem {
    displayAd {
      ...DisplayAd
    }
  }
  ...PosterViewItem
  ...StrategyViewItem
  ...RankingListViewItem
  ...NormalListViewItem
  ...MoreItem
  ...EventBannerItem
  ...PromotionBannerItem
  ...LineBannerItem
}
    

    fragment BannerItem on BannerItem {
  bannerType
  bannerViewType
  thumbnail
  videoUrl
  badgeList
  statusBadge
  titleImage
  title
  altText
  metaList
  caption
  scheme
  seriesId
  eventLog {
    ...EventLogFragment
  }
  discountRate
  discountRateText
  backgroundColor
  characterImage
}
    

    fragment OnAirItem on OnAirItem {
  thumbnail
  videoUrl
  titleImage
  title
  subtitleList
  caption
  scheme
}
    

    fragment CardViewItem on CardViewItem {
  title
  altText
  thumbnail
  scheme
  badgeList
  ageGradeBadge
  statusBadge
  ageGrade
  selfCensorship
  subtitleList
  caption
  rank
  rankVariation
  isEventBanner
  categoryType
  discountRate
  discountRateText
  backgroundColor
  isBook
  isLegacy
  cardCover {
    ...CardCoverFragment
  }
  eventLog {
    ...EventLogFragment
  }
}
    

    fragment CardCoverFragment on CardCover {
  coverImg
  coverRestricted
}
    

    fragment CleanViewItem on CleanViewItem {
  id
  type
  showPlayerIcon
  scheme
  title
  thumbnail
  badgeList
  ageGradeBadge
  statusBadge
  subtitleList
  rank
  ageGrade
  selfCensorship
  eventLog {
    ...EventLogFragment
  }
  discountRate
  discountRateText
}
    

    fragment PosterViewItem on PosterViewItem {
  id
  type
  showPlayerIcon
  scheme
  title
  altText
  thumbnail
  badgeList
  labelBadgeList
  ageGradeBadge
  statusBadge
  subtitleList
  rank
  rankVariation
  ageGrade
  selfCensorship
  eventLog {
    ...EventLogFragment
  }
  seriesId
  showDimmedThumbnail
  discountRate
  discountRateText
}
    

    fragment StrategyViewItem on StrategyViewItem {
  id
  title
  count
  scheme
}
    

    fragment RankingListViewItem on RankingListViewItem {
  title
  thumbnail
  badgeList
  ageGradeBadge
  statusBadge
  ageGrade
  selfCensorship
  metaList
  descriptionList
  scheme
  rank
  eventLog {
    ...EventLogFragment
  }
  discountRate
  discountRateText
}
    

    fragment NormalListViewItem on NormalListViewItem {
  id
  type
  altText
  ticketUid
  thumbnail
  badgeList
  ageGradeBadge
  statusBadge
  ageGrade
  isAlaramOn
  row1
  row2
  row3 {
    id
    metaList
  }
  row4
  row5
  scheme
  continueScheme
  nextProductScheme
  continueData {
    ...ContinueInfoFragment
  }
  seriesId
  isCheckMode
  isChecked
  isReceived
  isHelixGift
  price
  discountPrice
  discountRate
  discountRateText
  showPlayerIcon
  rank
  isSingle
  singleSlideType
  ageGrade
  selfCensorship
  eventLog {
    ...EventLogFragment
  }
  giftEventLog {
    ...EventLogFragment
  }
}
    

    fragment ContinueInfoFragment on ContinueInfo {
  title
  isFree
  productId
  lastReadProductId
  scheme
  continueProductType
  hasNewSingle
  hasUnreadSingle
}
    

    fragment MoreItem on MoreItem {
  id
  scheme
  title
}
    

    fragment EventBannerItem on EventBannerItem {
  bannerType
  thumbnail
  videoUrl
  titleImage
  title
  subtitleList
  caption
  scheme
  eventLog {
    ...EventLogFragment
  }
}
    

    fragment LineBannerItem on LineBannerItem {
  title
  scheme
  subTitle
  bgColor
  rightImage
  eventLog {
    ...EventLogFragment
  }
}
    

    fragment Group on Group {
  id
  ... on ListViewGroup {
    meta {
      title
      count
    }
  }
  ... on CardViewGroup {
    meta {
      title
      count
    }
  }
  ... on PosterViewGroup {
    meta {
      title
      count
    }
  }
  type
  dataKey
  groups {
    ...GroupInGroup
  }
  items {
    ...Item
  }
}
    

    fragment GroupInGroup on Group {
  id
  type
  dataKey
  items {
    ...Item
  }
  ... on ListViewGroup {
    meta {
      title
      count
    }
  }
  ... on CardViewGroup {
    meta {
      title
      count
    }
  }
  ... on PosterViewGroup {
    meta {
      title
      count
    }
  }
}`;

  const payload = {
    operationName: "staticLandingDayOfWeekLayout",
    query: fullQuery,
    variables: inputVariables
  };

  const existingToons = await findExistsToons(ToonProvider.KAKAO_P);

  const createData: ToonDto[] = [];
  const updateData: ToonUpdate[] = [];
  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, payload, {
      headers: COMMON_HEADERS
    });

    let items = response.data.data.staticLandingDayOfWeekLayout.sections[0].groups[0].items;
    const resultRest = await fetchAllPages(dayNum);
    items = items.concat(resultRest);

    for (const item of items) {
      if (!item.eventLog?.eventMeta?.series_id) {
        continue;
      }
      const toonId = Number(item.eventLog.eventMeta.series_id);
      const isAdult = item.ageGrade === 'Nineteen';
      const title = item.title;

      console.log(`✅ ${item.title} 정보 수집 시작`)
      const totalEpisode = await fetchWebtoonDataDetail(toonId);
      const summary = await fetchWebtoonDataSummary(toonId);

      const findToon = existingToons.find(toon => toon.toonId === toonId);
      if (findToon) {
        if (findToon.status !== ToonStatus.FINISHED || findToon.totalEpisode !== totalEpisode) {
          const webtoon = {
            toonId,
            title,
            status: ToonStatus.FINISHED,
            publishDays: '완결',
            totalEpisode,
            provider: ToonProvider.KAKAO_P,
          } as ToonUpdate;
          updateData.push(webtoon);
        }
      } else {
        const webtoon = {
          toonId,
          provider: ToonProvider.KAKAO_P,
          title,
          authors: summary ? summary.author : null,
          status: dayNum === '12' ? ToonStatus.FINISHED : ToonStatus.ONGOING,
          isAdult,
          publishDays: dayNum,
          imageUrl: `https:${item.thumbnail}`,
          pageUrl: `https://page.kakao.com/content/${toonId}`,
          summary: summary ? summary.summary : null,
          genre: mapGenreToEnum(item.eventLog.eventMeta.subcategory),
          totalEpisode,
        } as ToonDto
        createData.push(webtoon);
      }
    }

    return {
      createData,
      updateData
    };

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`❌ GraphQL 요청 실패: ${error.response.status} - ${error.message}`);
    } else {
      console.error(`❌ 요청 중 예기치 않은 오류 발생: ${error.message}`);
    }
    return {
      createData: [],
      updateData: []
    };
  }
}


async function fetchWebtoonDataDetail(id: number): Promise<string | null> {

  const inputVariables = {
    seriesId: id,
    boughtOnly: false,
    sortType: "desc"
  };

  const fullQuery = `
    query contentHomeProductList($after: String, $before: String, $first: Int, $last: Int, $seriesId: Long!, $boughtOnly: Boolean, $sortType: String) {
        contentHomeProductList(
            seriesId: $seriesId
            after: $after
            before: $before
            first: $first
            last: $last
            boughtOnly: $boughtOnly
            sortType: $sortType
        ) {
            totalCount
            pageInfo {
                hasNextPage
                endCursor
                hasPreviousPage
                startCursor
            }
            selectedSortOption {
                id
                name
                param
            }
            sortOptionList {
                id
                name
                param
            }
            edges {
                cursor
                node {
                    ...SingleListViewItem
                }
            }
        }
    }
    
    fragment SingleListViewItem on SingleListViewItem {
        id
        type
        thumbnail
        showPlayerIcon
        isCheckMode
        isChecked
        scheme
        row1
        row2
        row3 {
            badgeList
            text
            priceList
        }
        single {
            productId
            ageGrade
            id
            isFree
            thumbnail
            title
            slideType
            operatorProperty {
                isTextViewer
            }
        }
        isViewed
        eventLog {
            ...EventLogFragment
        }
        discountRate
        discountRateText
    }
    
    fragment EventLogFragment on EventLog {
        fromGraphql
        click {
            layer1
            layer2
            setnum
            ordnum
            copy
            imp_id
            imp_provider
        }
        eventMeta {
            id
            name
            subcategory
            category
            series
            provider
            series_id
            type
        }
        viewimp_contents {
            type
            name
            id
            imp_area_ordnum
            imp_id
            imp_provider
            imp_type
            layer1
            layer2
        }
        customProps {
            landing_path
            view_type
            helix_id
            helix_yn
            helix_seed
            content_cnt
            event_series_id
            event_ticket_type
            play_url
            banner_uid
        }
    }
`;

  const payload = {
    operationName: "contentHomeProductList",
    query: fullQuery,
    variables: inputVariables
  };

  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, payload, {
      headers: COMMON_HEADERS
    });

    return response.data.data.contentHomeProductList.totalCount;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`❌ GraphQL 요청 실패: ${error.response.status} - ${error.message}`);
    } else {
      console.error(`❌ 요청 중 예기치 않은 오류 발생: ${error.message}`);
    }
    return null;
  }
}


async function fetchWebtoonDataSummary(id: number): Promise<any> {

  const inputVariables = {
    seriesId: id
  };

  const fullQuery = `query contentHomeInfo($seriesId: Long!) {
        contentHomeInfo(seriesId: $seriesId) {
            about {
                id
                themeKeywordList {
                    uid
                    title
                    scheme
                }
                description
                screenshotList
                authorList {
                    id
                    name
                    role
                    roleDisplayName
                }
                detail {
                    id
                    publisherName
                    retailPrice
                    ageGrade
                    category
                    rank
                }
                guideTitle
                characterList {
                    thumbnail
                    name
                    description
                }
                detailInfoList {
                    title
                    info
                }
            }
            recommend {
                id
                seriesId
                list {
                    ...ContentRecommendGroup
                }
            }
        }
    }
    
    fragment ContentRecommendGroup on ContentRecommendGroup {
        id
        impLabel
        type
        title
        description
        items {
            id
            type
            ...PosterViewItem
        }
    }
    
    fragment PosterViewItem on PosterViewItem {
        id
        type
        showPlayerIcon
        scheme
        title
        altText
        thumbnail
        badgeList
        labelBadgeList
        ageGradeBadge
        statusBadge
        subtitleList
        rank
        rankVariation
        ageGrade
        selfCensorship
        eventLog {
            ...EventLogFragment
        }
        seriesId
        showDimmedThumbnail
        discountRate
        discountRateText
    }
    
    fragment EventLogFragment on EventLog {
        fromGraphql
        click {
            layer1
            layer2
            setnum
            ordnum
            copy
            imp_id
            imp_provider
        }
        eventMeta {
            id
            name
            subcategory
            category
            series
            provider
            series_id
            type
        }
        viewimp_contents {
            type
            name
            id
            imp_area_ordnum
            imp_id
            imp_provider
            imp_type
            layer1
            layer2
        }
        customProps {
            landing_path
            view_type
            helix_id
            helix_yn
            helix_seed
            content_cnt
            event_series_id
            event_ticket_type
            play_url
            banner_uid
        }
    }
`;

  const payload = {
    operationName: "contentHomeInfo",
    query: fullQuery,
    variables: inputVariables
  };

  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, payload, {
      headers: COMMON_HEADERS
    });

    const responseData = response.data.data.contentHomeInfo.about;

    let summary = responseData.description;
    summary = summary.replace(/\n/g, ' ').replace('  ', ' ');

    return {
      summary,
      author: responseData.authorList.map(author => author.name).join(', ')
    } as any;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`❌ GraphQL 요청 실패: ${error.response.status} - ${error.message}`);
    } else {
      console.error(`❌ 요청 중 예기치 않은 오류 발생: ${error.message}`);
    }
    return null;
  }
}

export async function getKakaoPFinishedToons(): Promise<SyncResult> {
  console.log("[완결] 카카오 페이지 데이터 수집 시작");
  const startTime = Date.now();
  const result = await fetchWebtoonData('12');
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  console.log(`[완결] 카카오 페이지 수집 완료 - 갯수 ${result.createData.length + result.updateData.length}개, 소요 시간: ${duration}초`);
  return result;
}