export const ExceptionCode = {
  // 회원
  USER_NOT_FOUND: {message: '사용자를 찾을 수 없습니다.', status: 400},
  USER_ALREADY_EXISTS: {message: '이미 존재하는 회원입니다.', status: 409},
  NICKNAME_ALREADY_EXISTS: {message: '이미 존재하는 닉네임입니다.', status: 409},
  CREDENTIALS_INVALID: {message: '아이디나 비밀번호를 확인해주세요.', status: 401},
  TOKEN_INVALID: {message: '유효하지 않은 토큰입니다.', status: 401},
  UNAUTHORIZED: {message: '접근 권한이 없습니다.', status: 403},
  USER_ACCOUNT_PENDING: {message: '이메일 인증이 필요합니다.', status: 403},
  USER_ACCOUNT_BLOCKED: {message: '사용자 계정이 차단되었습니다.', status: 403},
  USER_ACCOUNT_DELETED: {message: '사용자 계정이 탈퇴되었습니다.', status: 403},

  // 만화
  TOON_ALREADY_EXISTS: {message: '이미 존재하는 만화입니다.', status: 400},
  TOON_NOT_FOUND: {message: '만화를 찾을 수 없습니다.', status: 400},

  // 게시물
  POST_NOT_FOUND: {message: '게시물을 찾을 수 없습니다.', status: 400},
  POST_NOT_OWNER: {message: '해당 게시글에 대한 권한이 없습니다.', status: 403},

  //댓글
  COMMENT_NOT_FOUND: {message: '댓글을 찾을 수 없습니다.', status: 400},
  COMMENT_NOT_OWNER: {message: '해당 댓글에 대한 권한이 없습니다.', status: 403},

} as const;