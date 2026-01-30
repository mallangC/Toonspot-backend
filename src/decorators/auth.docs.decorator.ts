import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuthDocs() {
  return applyDecorators(
      ApiBearerAuth(),
      ApiUnauthorizedResponse({ description: '인증되지 않은 사용자 (JWT 토큰 누락 또는 만료)' }),
  );
}