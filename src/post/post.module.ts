import {Module} from '@nestjs/common';
import {PostController} from './post.controller';
import {PostService} from './post.service';
import {PostRepository} from "./post.repository";
import {PrismaModule} from "../../prisma/prisma.module";
import {UserModule} from "../user/user.module";

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [PostController],
  providers: [PostService, PostRepository],
  exports: [PostRepository]
})
export class PostModule {}
