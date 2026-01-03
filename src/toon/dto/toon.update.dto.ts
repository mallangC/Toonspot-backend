import {ToonGenre, ToonProvider, ToonStatus} from "@prisma/client";
import {IsInt, IsNotEmpty, IsNumber, IsOptional} from "class-validator";
import {Transform} from "class-transformer";

export class ToonUpdateDto {
  @IsNotEmpty({message: 'id를 입력해주세요.'})
  @IsInt({message: 'id는 숫자로 입력해주세요.'})
  id: number;
  @IsNotEmpty({message: 'toonId를 입력해주세요.'})
  toonId: number;
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
  @Transform(({value}) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isAdult: boolean;
  @IsNotEmpty({message: '이미지 주소를 입력해주세요.'})
  imageUrl: string;
  @IsNotEmpty({message: '페이지 주소를 입력해주세요.'})
  pageUrl: string;
  totalEpisode?: number;
  @IsNotEmpty({message: '연재 요일을 입력해주세요.'})
  publishDays: string;
}