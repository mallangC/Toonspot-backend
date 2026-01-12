import {CommentStatus} from "@prisma/client";
import {IsEnum} from "class-validator";

export class CommentUpdateStatusDto {
  @IsEnum(CommentStatus, {message: '잘못된 상태입니다.'})
  status: CommentStatus;
}