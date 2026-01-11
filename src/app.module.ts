import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {HttpExceptionFilter} from "./exception/http.exception.filter";
import {LoggerMiddleware} from "./middlewares/logger.middleware";
import {LoggingInterceptor} from "./interceptors/success.interceptor";
import {PrismaModule} from "../prisma/prisma.module";
import {ConfigModule} from "@nestjs/config";
import {ScheduleModule} from "@nestjs/schedule";
import {ToonModule} from './toon/toon.module';
import {PostModule} from "./post/post.module";
import { LikeModule } from './like/like.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    AuthModule,
    ScheduleModule.forRoot(),
    ToonModule,
    PostModule,
    LikeModule,
    CommentModule
  ],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  }, {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter,
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(LoggerMiddleware)
        .forRoutes('*')
  }
}
