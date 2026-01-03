import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, IsUrl} from "class-validator";
import {Optional} from "@nestjs/common";

export class ToonCreateDto {
  @IsNotEmpty({message: '웹툰 id를 입력해주세요.'})
  @IsInt({message: '웹툰 id는 숫자로 입력해주세요.'})
  toonId: number;
  @IsNotEmpty({message: '공급자를 입력해주세요.'})
  @IsEnum(ToonProvider)
  provider: ToonProvider;
  @IsNotEmpty({message: '제목을 입력해주세요.'})
  @IsString({message: '문자를 입력해주세요.'})
  title: string;
  @IsNotEmpty({message: '작가를입력해주세요.'})
  @IsString({message: '문자를 입력해주세요.'})
  authors: string;
  @IsNotEmpty({message: '줄거리를 입력해주세요.'})
  @IsString({message: '문자를 입력해주세요.'})
  summary: string;
  @IsNotEmpty({message: '장르를 입력해주세요.'})
  @IsEnum(ToonGenre)
  genre: ToonGenre;
  @Optional()
  @IsNumber({},{message: '별점은 숫자로 입력해주세요.'})
  rating?: number;
  @IsNotEmpty({message: '상태를 입력해주세요.'})
  @IsEnum(ToonStatus)
  status: ToonStatus;
  @IsNotEmpty({message: '성인 유무를 입력해주세요.'})
  @IsBoolean({message: 'boolean 형식으로 입력해주세요.'})
  isAdult: boolean;
  @IsNotEmpty({message: '이미지 주소를 입력해주세요.'})
  @IsNotEmpty({message: '이미지 주소를 입력해주세요.'})
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  }, {message: 'URL 형식이 아닙니다.'})
  imageUrl: string;
  @IsNotEmpty({message: '페이지 주소를 입력해주세요.'})
  @IsUrl({
    protocols: ['https'],
    require_protocol: true,
    require_valid_protocol: true,
  }, {message: 'URL 형식이 아닙니다.'})
  pageUrl: string;
  @Optional()
  @IsInt({message: '최신화는 숫자로 입력해주세요.'})
  totalEpisode?: number;
  @IsNotEmpty({message: '연재 요일을 입력해주세요.'})
  @IsString({message: '문자를 입력해주세요.'})
  publishDays: string;
}