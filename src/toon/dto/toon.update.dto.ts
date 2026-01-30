import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {IsBoolean, IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class ToonUpdateDto {
  @IsNotEmpty({message: 'platformId를 입력해주세요.'})
  platformId: number;
  @IsNotEmpty({message: '공급자를 입력해주세요.'})
  provider: ToonProvider;
  @IsNotEmpty({message: '제목을 입력해주세요.'})
  title: string;
  @IsNotEmpty({message: '작가를입력해주세요.'})
  authors: string;
  @IsNotEmpty({message: '줄거리를 입력해주세요.'})
  summary: string;
  @IsNotEmpty({message: '장르를 입력해주세요.'})
  genre: ToonGenre;
  @IsOptional()
  @IsNumber({},{message: '별점은 숫자로 입력해주세요.'})
  rating?: number;
  @IsNotEmpty({message: '상태를 입력해주세요.'})
  status: ToonStatus;
  @IsNotEmpty({message: '성인 유무를 입력해주세요.'})
  @IsBoolean({message: '성인 유무는 boolean 형식으로 입력해주세요.'})
  isAdult: boolean;
  @IsNotEmpty({message: '이미지 주소를 입력해주세요.'})
  imageUrl: string;
  @IsNotEmpty({message: '페이지 주소를 입력해주세요.'})
  pageUrl: string;
  totalEpisode?: number;
  @IsNotEmpty({message: '연재 요일을 입력해주세요.'})
  publishDays: string;
}