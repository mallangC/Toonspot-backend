import {Module} from '@nestjs/common';
import {PostController} from './post.controller';
import {PostService} from './post.service';
import {PostRepository} from "./post.repository";
import {PrismaModule} from "../../prisma/prisma.module";
import {UserModule} from "../user/user.module";
import {ToonModule} from "../toon/toon.module";

@Module({
  imports: [PrismaModule, UserModule, ToonModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostRepository]
})
export class PostModule {}
