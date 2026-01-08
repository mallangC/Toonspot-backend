import {Module} from '@nestjs/common';
import {LikeController} from './like.controller';
import {LikeService} from './like.service';
import {PrismaModule} from "../../prisma/prisma.module";
import {LikeRepository} from "./like.repository";
import {PostModule} from "../post/post.module";

@Module({
  imports: [PrismaModule, PostModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository]
})
export class LikeModule {}
