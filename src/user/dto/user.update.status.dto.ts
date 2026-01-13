import {UserStatus} from "@prisma/client";
import {IsEnum, IsNotEmpty} from "class-validator";

export class UserUpdateStatusDto {
  @IsNotEmpty({message: '상태를 입력해주세요.'})
  @IsEnum(UserStatus, {message: '잘못된 상태입니다.'})
  status: UserStatus;
}