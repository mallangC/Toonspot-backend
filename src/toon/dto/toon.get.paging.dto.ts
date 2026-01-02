import {ToonProvider} from "@prisma/client";
import {IsInt, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";

export class ToonGetPagingDto {
  @Type(() => Number)
  @IsInt({message: '페이지 번호는 숫자여야 합니다.'})
  page: number;
  @IsOptional()
  provider?: ToonProvider;
  @IsOptional()
  isAdult?: boolean;
  @IsOptional()
  order: string = 'title';
  @IsOptional()
  sortBy: 'asc' | 'desc' = 'asc';
}