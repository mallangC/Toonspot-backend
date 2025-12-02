import {IsEmail, IsNotEmpty} from "class-validator";

export class RegisterRequestDto {
  @IsEmail({}, {message: '이메일 형식이 아닙니다.'})
  email: string;
  @IsNotEmpty({message: '닉네임을 입력해주세요.'})
  nickname: string;
  @IsNotEmpty({message: '비밀번호를 입력해주세요.'})
  password: string;
}