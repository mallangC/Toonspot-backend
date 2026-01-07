import {PostStatus} from "@prisma/client";
import {IsEnum, IsNotEmpty} from "class-validator";

export class PostUpdateStatusDto {
  @IsNotEmpty({message: '상태를 입력해주세요.'})
  @IsEnum(PostStatus, {message: '잘못된 상태입니다.'})
  status: PostStatus;
}