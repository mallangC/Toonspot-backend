import {IsInt, IsNotEmpty} from "class-validator";
import {Transform} from "class-transformer";

export class ToonActiveDto {
  @IsNotEmpty({message: 'id를 입력해주세요.'})
  @IsInt({message: 'id는 숫자로 입력해주세요.'})
  id: number;
  @IsNotEmpty({message: '활성화 여부를 입력해주세요.'})
  @Transform(({value}) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive: boolean;
}
