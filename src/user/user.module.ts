import {forwardRef, Module} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {UserRepository} from "./user.repository";
import {AuthModule} from "../auth/auth.module";
import {PrismaService} from "../../prisma/prisma.service";
import {MailerModule} from "@nestjs-modules/mailer";
import process from "node:process";

@Module({
  imports: [forwardRef(() => AuthModule),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.EMAIL_USER as string,
          pass: process.env.EMAIL_PASSWORD as string
        }
      }
    })],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserRepository]
})
export class UserModule {}
