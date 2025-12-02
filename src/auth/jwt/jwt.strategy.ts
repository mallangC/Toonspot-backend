import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {Injectable} from "@nestjs/common";
import {UserRepository} from "../../user/user.repository";
import {Payload} from "./jwt.payload";
import {CustomException} from "../../exception/custom.exception";
import {ExceptionCode} from "../../exception/exception.code";
import process from "node:process";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY as string,
      ignoreExpiration: true,
    });
  }

  async validate(payload: Payload) {
    const findUser = await this.userRepository.findByEmail(payload.email);
    if (!findUser) {
      throw new CustomException(ExceptionCode.TOKEN_INVALID)
    }
    return findUser;
  }
}