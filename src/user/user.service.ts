import {Injectable} from '@nestjs/common';
import {UserRepository} from "./user.repository";
import {RegisterRequestDto} from "./dto/register.request.dto";
import * as bcrypt from 'bcrypt';
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(dto: RegisterRequestDto) {
    const {email, password, nickname} = dto;
    const isExistsUser = await this.userRepository.existsByEmail(email);
    if (isExistsUser) {
      throw new CustomException(ExceptionCode.ALREADY_EXISTS_USER)
    }

    await this.existsNickname(nickname);
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userRepository.save(dto, hashedPassword);
  }

  async getNicknameExists(nickname: string) {
    return this.userRepository.existsByNickname(nickname);
  }

  async updateUserNickname(email: string, nickname: string) {
    const isExistsUser = await this.userRepository.existsByEmail(email);
    if (!isExistsUser) {
      throw new CustomException(ExceptionCode.USER_NOT_FOUND)
    }
    await this.existsNickname(nickname);
    return this.userRepository.update(email, nickname);
  }

  async deleteUser(email: string) {
    await this.userRepository.delete(email);
    return '아이디가 삭제되었습니다.';
  }

  private async existsNickname(nickname: string) {
    const isExistsNickname = await this.userRepository.existsByNickname(nickname);
    if (isExistsNickname) {
      throw new CustomException(ExceptionCode.ALREADY_EXISTS_NICKNAME)
    }
  }
}
