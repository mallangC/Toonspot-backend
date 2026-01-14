import {Injectable} from '@nestjs/common';
import {UserRepository} from "./user.repository";
import {UserRegisterDto} from "./dto/user.register.dto";
import * as bcrypt from 'bcrypt';
import {CustomException} from "../exception/custom.exception";
import {ExceptionCode} from "../exception/exception.code";
import {UserStatus} from "@prisma/client";
import {v4 as uuidv4} from "uuid";
import {MailerService} from "@nestjs-modules/mailer";
import process from "node:process";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository,
              private readonly mailerService: MailerService) {
  }

  async signup(dto: UserRegisterDto) {
    const {email, password, nickname} = dto;
    const isExistsUser = await this.userRepository.existsByEmail(email);
    if (isExistsUser) {
      throw new CustomException(ExceptionCode.USER_ALREADY_EXISTS)
    }
    await this.existsNickname(nickname);
    const hashedPassword = await bcrypt.hash(password, 10);
    let verificationToken: string = '';

    while (true) {
      const existsToken = await this.userRepository.existsByToken(verificationToken);
      if (existsToken) {
        verificationToken = uuidv4();
      } else {
        break;
      }
    }

    const saveUser = await this.userRepository.save(dto, hashedPassword, verificationToken);
    const url = `http://localhost:3000/api/user/verify?token=${verificationToken}`;

    const isTest = process.env.NODE_ENV === 'test';
    console.log(`현재 NODE_ENV 값: ${isTest}`)
    if (isTest) {
      console.log(`[dev mode] 회원가입 인증 메일을 보내지 않습니다. (이메일: ${email})`);
    } else {
      this.mailerService.sendMail({
        to: email,
        subject: '[toonspot] 회원가입 인증 메일입니다.',
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>회원가입 인증</h2>
          <p>안녕하세요! 아래 버튼을 클릭하면 가입이 완료됩니다.</p>
          <a href="${url}" 
             style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
             이메일 인증하기
          </a>
          <p>이 링크는 24시간 동안 유효합니다.</p>
        </div>
      `,
      }).catch(err => {
        console.error(`이메일 발송 실패 (${email}):`, err);
      });
    }
    return saveUser;
  }

  async verifyToken(token: string) {
    const existsUser = await this.userRepository.existsByToken(token);
    if (!existsUser) {
      throw new CustomException(ExceptionCode.USER_NOT_FOUND);
    }
    await this.userRepository.updateVerify(token);
    return '이메인 인증이 완료되었습니다.';
  }

  async getProfileForAdmin(userId: number) {
    const findUser = await this.userRepository.findById(userId);
    if (!findUser) {
      throw new CustomException(ExceptionCode.USER_NOT_FOUND);
    }
    return findUser;
  }

  async getNicknameExists(nickname: string) {
    return this.userRepository.existsByNickname(nickname);
  }

  async updateNickname(email: string, nickname: string) {
    await this.existsNickname(nickname);
    return this.userRepository.updateNickname(email, nickname);
  }

  async updateStatus(userId: number, status: UserStatus) {
    const existsUser = await this.userRepository.existsById(userId);
    if (!existsUser) {
      throw new CustomException(ExceptionCode.USER_NOT_FOUND);
    }
    return this.userRepository.updateStatus(userId, status);
  }

  async deleteUser(email: string) {
    await this.userRepository.delete(email);
    return '회원 탈퇴 되었습니다.';
  }

  private async existsNickname(nickname: string) {
    const isExistsNickname = await this.userRepository.existsByNickname(nickname);
    if (isExistsNickname) {
      throw new CustomException(ExceptionCode.NICKNAME_ALREADY_EXISTS)
    }
  }
}
