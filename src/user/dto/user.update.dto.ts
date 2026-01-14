import {IsNotEmpty} from "class-validator";

export class UserUpdateDto {
  @IsNotEmpty({message: '닉네임을 입력해주세요.'})
  nickname: string;
}