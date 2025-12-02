import {forwardRef, Module} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {UserRepository} from "./user.repository";
import {AuthModule} from "../auth/auth.module";
import {PrismaService} from "../../prisma/prisma.service";

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserRepository]
})
export class UserModule {}
