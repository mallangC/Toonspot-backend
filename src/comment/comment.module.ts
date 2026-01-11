import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import {PrismaModule} from "../../prisma/prisma.module";
import {CommentRepository} from "./comment.repository";
import {PostModule} from "../post/post.module";

@Module({
  imports: [PrismaModule, PostModule],
  controllers: [CommentController],
  providers: [CommentService, CommentRepository],
  exports: [CommentRepository]
})
export class CommentModule {}
