import {Type} from "class-transformer";
import {IsInt, IsOptional, IsString, Min} from "class-validator";

export class PostGetPagingDto {
  @Type(() => Number)
  @IsInt({message: '페이지 번호는 숫자여야 합니다.'})
  @Min(1)
  page: number;
  @IsOptional()
  @IsString({message: '검색어는 문자열여야 합니다.'})
  keyword?: string;
}