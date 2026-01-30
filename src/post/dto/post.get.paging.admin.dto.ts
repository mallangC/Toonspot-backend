import {Type} from "class-transformer";
import {IsInt, IsNotEmpty, IsOptional, IsString, Min} from "class-validator";

export class PostGetPagingAdminDto {
  @Type(() => Number)
  @IsNotEmpty({message: '페이지 번호를 입력해주세요.'})
  @IsInt({message: '페이지 번호는 숫자여야 합니다.'})
  @Min(1)
  page: number;
  @IsOptional()
  @IsString({message: '검색어는 문자열여야 합니다.'})
  keyword?: string;
}