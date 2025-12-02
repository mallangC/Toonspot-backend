export const ExceptionCode = {
  // 회원관련
  USER_NOT_FOUND: {message: '사용자를 찾을 수 없습니다.', status: 400},
  ALREADY_EXISTS_USER: {message: '이미 존재하는 회원입니다.', status: 409},
  ALREADY_EXISTS_NICKNAME: {message: '이미 존재하는 닉네임입니다.', status: 409},
  WRONG_EMAIL_OR_PASSWORD: {message: '아이디나 비밀번호를 다시 확인해주세요.', status: 401},
  TOKEN_INVALID: {message: '유효하지 않은 토큰입니다.', status: 401},



} as const;