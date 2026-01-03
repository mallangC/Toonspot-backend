import {ToonProvider} from "@prisma/client";
import {IsIn, IsInt, IsOptional} from "class-validator";
import {Transform, Type} from "class-transformer";

export class ToonGetPagingDto {
  @Type(() => Number)
  @IsInt({message: '페이지 번호는 숫자여야 합니다.'})
  page: number;
  @IsOptional()
  provider?: ToonProvider;
  @IsOptional()
  @Transform(({value}) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isAdult?: boolean;
  @IsOptional()
  sortBy: string = 'title';
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}