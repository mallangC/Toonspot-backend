import {Module} from '@nestjs/common';
import {LikeController} from './like.controller';
import {LikeService} from './like.service';
import {PrismaModule} from "../../prisma/prisma.module";
import {LikeRepository} from "./like.repository";
import {PostModule} from "../post/post.module";
import {CommentModule} from "../comment/comment.module";

@Module({
  imports: [PrismaModule, PostModule, CommentModule],
  controllers: [LikeController],
  providers: [LikeService, LikeRepository]
})
export class LikeModule {}
