# 크론(Cron) 자동 글쓰기 설정 가이드

이 프로젝트는 크론(Cron) 작업을 통해 블로그 글을 자동으로 생성합니다.

## 작동 원리

1.  **트리거 (Trigger)**: GitHub Actions (`.github/workflows/cron.yml`)가 15분마다 실행됩니다.
2.  **동작 (Action)**: `https://[사용자_도메인]/api/cron` 주소로 GET 요청을 보냅니다.
3.  **인증 (Authentication)**: `CRON_SECRET` 키를 사용하여 안전하게 인증합니다.
4.  **실행 (Execution)**: API 라우트 (`src/app/api/cron/route.ts`)가 실행되어 Gemini AI를 호출하고 글을 생성한 뒤 Supabase에 저장합니다.

## 필수 환경 변수 설정

자동 글쓰기가 정상 작동하려면 **Vercel 프로젝트 설정(Project Settings)**에 아래 환경 변수들이 반드시 설정되어 있어야 합니다.

| 변수 이름 (Name) | 설명 (Description) | 설정 위치 (Vercel) | 설정 위치 (GitHub) |
| :--- | :--- | :--- | :--- |
| `CRON_SECRET` | API 보안을 위한 강력한 비밀번호 (직접 생성) | Environment Vars | Secrets |
| `VERCEL_APP_URL` | 사이트 전체 주소 (예: `https://jeonbuk-hasugu.com`) | 해당 없음 | Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 관리자 키 (RLS 우회 및 쓰기 권한용) | Environment Vars | 해당 없음 |
| `GOOGLE_GEMINI_API_KEY` | Gemini 사용을 위한 API 키 | Environment Vars | 해당 없음 |

> **중요**: `VERCEL_APP_URL`과 `CRON_SECRET`은 **GitHub 저장소 설정(Settings) > Secrets > Actions**에도 추가해야 GitHub Actions가 어디로 요청을 보낼지, 어떤 암호로 인증할지 알 수 있습니다.

## 문제 해결 (Troubleshooting)

### 1. "Unauthorized" 에러가 뜨는 경우
- Vercel과 GitHub Secrets에 입력한 `CRON_SECRET` 값이 서로 일치하는지 확인하세요.
- 요청 헤더에 `Authorization: Bearer [CRON_SECRET]`이 올바르게 포함되는지 확인하세요.

### 2. "Server Configuration Error"가 뜨는 경우
- Vercel 환경 변수에 `SUPABASE_SERVICE_ROLE_KEY`가 있는지 확인하세요.
- Vercel 환경 변수에 `GOOGLE_GEMINI_API_KEY`가 있는지 확인하세요.

## 수동 테스트 방법

`curl` 명령어를 사용해 강제로 크론 작업을 실행해볼 수 있습니다.

```bash
# 로컬 테스트 ( .env.local 에 키가 있어야 함)
curl -H "Authorization: Bearer [설정한_CRON_SECRET]" http://localhost:3000/api/cron

# 실서버 테스트
curl -H "Authorization: Bearer [설정한_CRON_SECRET]" https://[사용자_도메인]/api/cron
```
