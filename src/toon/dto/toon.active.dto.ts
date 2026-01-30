import {IsNotEmpty} from "class-validator";

export class ToonActiveDto {
  @IsNotEmpty({message: '활성화 여부를 입력해주세요.'})
  isActive: boolean;
}
