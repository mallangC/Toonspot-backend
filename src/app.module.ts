import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {AuthModule} from './auth/auth.module';
import {APP_FILTER, APP_INTERCEPTOR} from "@nestjs/core";
import {HttpExceptionFilter} from "./exception/http.exception.filter";
import {LoggerMiddleware} from "./logger.middleware";
import {LoggingInterceptor} from "./success.interceptor";
import {PrismaModule} from "../prisma/prisma.module";
import {ConfigModule} from "@nestjs/config";

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    AuthModule,
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
