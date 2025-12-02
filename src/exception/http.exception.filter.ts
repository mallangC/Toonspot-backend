import {ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger} from "@nestjs/common";
import {Request, Response} from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
        | string
        | { error: string; statusCode: number; message: string | string[] };

    const fullStack = (exception as Error).stack;
    let shortStack = '';
    if (fullStack) {
      const stackLine = fullStack.split('\n');
      shortStack = stackLine.slice(0,3).join('\n');
    }

    this.logger.error(`${request.method} ${request.url} ${status}`,
        shortStack);
    if (typeof error === 'string') {
      response.status(status)
          .json({
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            error
          });
    } else if (typeof error === 'object') {
      response.status(status)
          .json({
            success: false,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...error
          });
    }
  }
}