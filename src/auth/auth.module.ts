import {forwardRef, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {UserModule} from "../user/user.module";
import {JwtStrategy} from "./jwt/jwt.strategy";
import process from "node:process";

@Module({
  imports: [
      PassportModule.register({defaultStrategy: 'jwt', session: false}),
      JwtModule.register({
        secret: process.env.JWT_SECRET_KEY as string,
        signOptions: {expiresIn: '1d'}}),
      forwardRef(() => UserModule)
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
