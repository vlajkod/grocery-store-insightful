import { HttpException, HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  LOCATION_NOT_FOUND = 'LOCATION_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_HAS_NO_ACCESS = 'USER_HAS_NO_ACCESS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
}

export const ErrorCodeHttpMap: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.USER_HAS_NO_ACCESS]: HttpStatus.FORBIDDEN,
  [ErrorCode.LOCATION_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
};

export class AppException extends HttpException {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatus;
  public readonly externalError?: unknown;

  constructor(code: ErrorCode, message?: string, externalError?: unknown) {
    const status = ErrorCodeHttpMap[code] ?? HttpStatus.INTERNAL_SERVER_ERROR;
    super(message ?? code, status);

    this.code = code;
    this.statusCode = status;
    this.externalError = externalError;
  }
}
