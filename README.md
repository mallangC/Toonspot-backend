# 🚀 Webtoon Community API Service
> **NestJS 11 기반의 웹툰 정보 공유 및 커뮤니티 백엔드 시스템**
> 
[![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)

---

## 📌 프로젝트 개요 (Overview)
본 프로젝트는 다양한 플랫폼의 웹툰 데이터를 통합 관리하고, 유저 간 활발한 소통을 지원하는 커뮤니티 백엔드입니다.
단순한 CRUD를 넘어 **대량 요청에 대한 성능 최적화**와 **데이터 안정성**을 확보하는 데 초점을 맞추어 설계되었습니다.

## ✨ 주요 기능 상세 (Key Features)

### 👤 회원 서비스 (User Service)
- **보안 인증 체계**: **JWT(JSON Web Token)**를 활용하여 상태가 없는(Stateless) 인증 시스템을 구축하고, 안전한 로그인 및 권한 관리를 수행합니다.
- **이메일 계정 활성화**: 회원가입 시 **Nodemailer** 등을 이용한 인증 메일을 발송, 실제 소유주 확인 후 계정을 활성 상태로 전환하는 보안 로직을 포함합니다.
- **신뢰성 있는 탈퇴 정책**: 데이터 무결성을 위해 Hard Delete 대신 **Soft Delete**를 적용하여 유저 데이터를 안전하게 보존하고 예기치 못한 참조 오류를 방지합니다.

### 🎨 웹툰 서비스 (Webtoon Service)
- **멀티 플랫폼 식별자 연동**: 네이버, 카카오 등 외부 플랫폼의 **Platform ID**를 내부 고유 식별자와 매핑하여 데이터 확장성 및 연동성을 확보했습니다.
- **동적 상태 필터링**: 웹툰의 서비스 여부(`isActive`)에 따른 필터링 조회를 지원하여 사용자에게 항상 유효한 콘텐츠만 노출합니다.

### 📝 커뮤니티 서비스 (Community Service)
- **효율적인 조회수 관리**: **Redis 캐시**를 도입하여 동일 유저(IP/ID 기반)의 중복 조회를 실시간으로 필터링하고 데이터베이스의 쓰기 부하를 최소화 및 조회수 최적화했습니다.
- **게시물(Post) CRUD**: 텍스트 기반의 게시글 관리 기능을 제공하며, 작성자 권한 검증을 통해 안전한 수정을 지원합니다.
- **게시물 블라인드 정책**: 게시물 비활성화(BLOCKED) 기능을 구현해 운영 정책 위반 게시물을 즉시 비활성화 처리하여 커뮤니티 가이드라인을 준수합니다.

### 💬 댓글 서비스 (Comment Service)
- **양방향 소통 시스템**: 게시글에 대한 사용자 의견 작성을 지원하며, 게시글-유저 간의 연관 관계를 바탕으로 실시간 소통 기능을 제공합니다.
- **데이터 일관성**: 게시글 삭제 시 관련 댓글의 처리(Soft Delete) 로직을 통해 커뮤니티 데이터의 정합성을 유지합니다.
- **댓글 블라인드 정책**: 댓글 비활성화(BLOCKED) 기능을 구현해 운영 정책 위반 댓글을 즉시 비활성화 처리하여 커뮤니티 가이드라인을 준수합니다.

### ❤️ 좋아요 서비스 (Like Service)
- **상호작용 피드백**: 게시물 및 댓글에 대한 유저의 긍정적 반응을 기록하며, 중복 좋아요 방지 로직을 통해 투명한 추천 시스템을 운영합니다.
- **실시간 카운팅**: 콘텐츠별 좋아요 총계를 효율적으로 계산하여 사용자 참여도를 시각화합니다.

### ⭐ 즐겨찾기 서비스 (Favorite Service)
- **개인화 맞춤형 보관함**: 사용자가 선호하는 웹툰이나 게시판을 즐겨찾기에 등록하여 빠르게 접근할 수 있는 개인화 기능을 제공합니다.
- **빠른 접근성 최적화**: 즐겨찾기 데이터 인덱싱을 통해 대량의 데이터 중에서도 사용자의 관심 콘텐츠를 신속하게 조회합니다.
- **실시간 카운팅**: 웹툰별 즐겨찾기 총계를 효율적으로 계산하여 사용자 관심도를 시각화합니다.

---

## 🔥 핵심 기술 구현 (Key Implementations)

### 1. Redis 기반 조회수 중복 방지
단순 새로고침을 통한 조회수 조작을 방지하고 데이터베이스의 쓰기(Write) 부하를 최소화하기 위해 Redis 캐싱 레이어를 구축했습니다.
- **구현 로직:** `post:view:{postId}:{identifier}` 형태의 키에 24시간 TTL을 적용하여 중복 기록 방지.
- **식별 전략:** 로그인 유저는 `User Data ID`, 비로그인 유저는 `IP 주소`를 활용하여 고유 사용자 식별.
- **효과:** 무분별한 DB Update 쿼리 발생을 차단하여 시스템 자원 효율화.

### 2. 안정적인 데이터 보존을 위한 Soft Delete
회원 탈퇴 시 발생할 수 있는 데이터 참조 무결성 오류를 방지하고, 통계 및 운영 데이터를 보존하기 위해 Soft Delete 정책을 적용했습니다.
- **방식:** 실제 데이터를 삭제하지 않고 `status` 필드를 `DELETED` 로 업데이트.
- **적용:** 회원 탈퇴 및 게시글 삭제 로직에 반영하여 서비스 운영의 안정성을 확보.

---

## 🚀 Troubleshooting & 기술적 도전

### 1. 데이터 수집 방식의 전환
단순한 기술적 우회를 넘어 서비스의 **지속 가능성**과 **데이터 신뢰성**을 우선한 아키텍처 개선 사례입니다.
- **이슈**: Puppeteer를 이용한 크롤링 시도 중, 타겟 플랫폼(카카오 페이지)의 IP 차단 및 동적 렌더링 방어 기제 발생. AI를 활용해 다양한 우회법을 시도했으나, 이는 근본적인 해결책이 아니며 향후 방어 기제가 강화될 시 서비스 중단 리스크가 크다고 판단함.
- **해결**: 기술적 우회보다는 구조적 안정성을 선택하여, 신뢰할 수 있는 **API 요청 방식**으로 수집 로직을 전면 수정함.
- **성과**: 데이터 수집의 불확실성을 제거하고 정합성을 확보했으며, 헤드리스 브라우저 실행 오버헤드를 줄여 시스템 자원 효율성을 높임.

### 2. 테스트 환경의 순차적 실행
비동기 테스트 환경에서 발생하는 DB 자원 경합 문제를 해결하여 테스트를 **순차적 실행**하도록 했습니다.
- **이슈**: `npm run test` 실행 시 개별 테스트 함수들이 병렬적으로 실행되면서, 동일한 데이터베이스 자원에 동시 접근하여 데이터 중복 오류(Unique Constraint Violation) 발생.
- **해결**: Jest 실행 스크립트에 `--runInBand` 옵션을 도입하여 테스트 케이스가 하나의 프로세스에서 순차적으로 실행되도록 강제함.
- **성과**: 테스트 간의 간섭을 원천 차단하여 테스트 성공률 100%를 달성하고, CI/CD 파이프라인의 신뢰도를 강화함.

### 3. NestJS 11 & 패키지 의존성 최적화
최신 프레임워크 도입 과정에서 발생한 패키지 호환성 문제를 해결하며 안정적인 개발 환경을 구축했습니다.
- **이슈**: NestJS 11 버전 업그레이드 시 `@nestjs/cache-manager` 등 주요 모듈과 최신 엔진 간의 `ERESOLVE` 종속성 충돌 발생.
- **해결**: `.npmrc` 설정 최적화 및 `--legacy-peer-deps` 전략을 수립하여 의존성 트리를 정제하고 빌드 안정성 확보.
- **성과**: 최신 프레임워크의 기능을 안전하게 도입하고, 향후 패키지 업데이트 시 발생할 수 있는 잠재적 충돌을 최소화함.

---

## 🛠 기술 스택 (Tech Stack)
- **Backend:** Node.js, NestJS v11 (Modular Architecture)
- **Database:** PostgreSQL & Prisma ORM
- **Cache:** Redis
- **Security:** JWT, Passport.js, Bcrypt
- **Documentation:** Swagger

---

## 📁 프로젝트 구조 (Project Structure)
```text
src/
├── common/             # 공통 가드, 인터셉터, 필터, 커스텀 데코레이터
├── config/             # 환경 변수 및 글로벌 설정
├── modules/
│   ├── auth/           # JWT 기반 인증/인가 및 권한 검증
│   ├── user/           # 회원 프로필 관리 및 계정 상태 제어
│   ├── toon/           # 웹툰 메타데이터 관리
│   ├── post/           # 커뮤니티 게시물 관리 및 Redis 기반 조회수 최적화 엔진
│   ├── comment/        # 게시물별 댓글 시스템
│   ├── like/           # 게시물 및 댓글에 대한 유저 반응(좋아요) 처리 로직
│   ├── favorite/       # 관심 웹툰 및 선호 게시판 북마크(즐겨찾기) 기능
│   ├── util/           # 전역적으로 사용되는 헬퍼 함수 (날짜 변환, 문자열 처리 등)
│   ├── api/            # 외부 플랫폼(Naver, Kakao 등) API 연동 및 데이터 통신 로직
│   ├── exception/      # 커스텀 에러 정의 및 전역 예외 처리(Exception Filter) 관리
│   ├── decorators/     # Swagger 자동화 및 유저 정보 추출을 위한 커스텀 데코레이터
│   ├── interceptors/   # 응답 데이터 가공 및 요청/응답 로깅 처리 인터셉터
│   └── middlewares/    # HTTP 요청 전 단계에서 실행되는 미들웨어 (로그, 보안 등)
prisma/                 # DB Schema 및 Migration 파일
```
---
📖 API Documentation (Swagger)
모든 API는 Swagger를 통해 명세화되었으며, 테스트가 가능합니다.

URL: http://localhost:3000/docs

주요 특징: - @ApiAuthDocs: JWT 인증이 필요한 API에 대한 일괄 보안 적용.

DTO 기반 응답 스키마 정의 및 Enum 타입 자동 문서화.