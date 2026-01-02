export const ExceptionCode = {
  // 회원
  USER_NOT_FOUND: {message: '사용자를 찾을 수 없습니다.', status: 400},
  USER_ALREADY_EXISTS: {message: '이미 존재하는 회원입니다.', status: 409},
  NICKNAME_ALREADY_EXISTS: {message: '이미 존재하는 닉네임입니다.', status: 409},
  CREDENTIALS_INVALID: {message: '아이디나 비밀번호를 확인해주세요.', status: 401},
  TOKEN_INVALID: {message: '유효하지 않은 토큰입니다.', status: 401},

  // 만화
  TOON_ALREADY_EXISTS: {message: '이미 존재하는 만화입니다.', status: 400},
  TOON_NOT_FOUND: {message: '만화를 찾을 수 없습니다.', status: 400},

} as const;