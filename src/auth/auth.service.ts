import { Injectable } from '@nestjs/common';
import {UserRepository} from "../user/user.repository";
import {JwtService} from "@nestjs/jwt";
import {ExceptionCode} from "../exception/exception.code";
import {CustomException} from "../exception/custom.exception";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository,
              private jwtService: JwtService) {}

  async login(email: string, password: string) {
    const findUser = await this.userRepository.findByEmailWithPassword(email);
    if (!findUser) {
      throw new CustomException(ExceptionCode.WRONG_EMAIL_OR_PASSWORD)
    }

    const isPasswordValidated = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValidated) {
      throw new CustomException(ExceptionCode.WRONG_EMAIL_OR_PASSWORD)
    }
    const payload = {email, sub: findUser.id};
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
