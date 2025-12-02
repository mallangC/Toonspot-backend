import { HttpException } from '@nestjs/common';
import { ExceptionCode } from './exception.code';

type ErrorCode = typeof ExceptionCode[keyof typeof ExceptionCode];

export class CustomException extends HttpException {
  constructor(errorCode: ErrorCode) {
    super(
        {
          statusCode: errorCode.status,
          message: errorCode.message,
          timestamp: new Date().toISOString(),
        },
        errorCode.status,
    );
  }
}