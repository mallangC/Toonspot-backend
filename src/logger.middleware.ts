import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const {statusCode} = res;
      if (statusCode < 400) {
        this.logger.log(`${req.method} ${req.url} ${res.statusCode}`);
      }
    })
    next();
  }
}
