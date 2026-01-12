import {IsNotEmpty} from "class-validator";

export class CommentDto {
  @IsNotEmpty({message: '내용을 입력해주세요.'})
  content: string;
}