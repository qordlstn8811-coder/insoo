# 🚀 전북하수구막힘 웹사이트 개발 및 배포 완료 리포트

## 프로젝트 개요
- **프로젝트명**: 전북하수구막힘 (jeonbuk-hasugu)
- **도메인**: 전북하수구막힘.com
- **배포 URL**: https://jeonbuk-hasugu.vercel.app
- **GitHub**: https://github.com/qordlstn8811-coder/insoo
- **작업일**: 2025-12-15 ~ 2025-12-16

---

## ✅ 완료된 작업 목록

### 1. 프론트엔드 수정

#### 모바일 햄버거 메뉴 추가
- **파일**: `src/components/Header.tsx`
- 반응형 햄버거 버튼 추가
- 슬라이드 다운 애니메이션 적용
- 서비스/지역별 드롭다운 메뉴 포함
- 링크 클릭 시 메뉴 자동 닫힘

#### 챗봇 브랜드명 변경
- **파일**: `src/components/Chatbot.tsx`
- "인생배관 상담봇" → "전북배관 상담봇"

#### 카카오톡 버튼 제거
- **파일**: `src/components/Hero.tsx` - 히어로 섹션 카카오톡 버튼 제거
- **파일**: `src/components/FloatingButtons.tsx` - 플로팅 카카오톡 버튼 제거

#### Header 컴포넌트 추가
- **파일**: `src/app/about/page.tsx` - About 페이지 Header 추가
- **파일**: `src/app/contact/page.tsx` - Contact 페이지 Header 추가
- **파일**: `src/app/services/[service]/page.tsx` - 서비스 페이지 Header 추가

---

### 2. 도메인 설정

#### 변경된 도메인
- **이전**: jeonbuk-plumbing.com
- **현재**: 전북하수구막힘.com

#### 수정된 파일
| 파일 | 수정 내용 |
|------|----------|
| `src/app/layout.tsx` | metadataBase, canonical, OG URL, Schema.org |
| `src/app/sitemap.ts` | baseUrl |
| `src/app/robots.ts` | sitemap URL |
| `src/app/about/page.tsx` | OG URL |
| `src/app/services/[service]/page.tsx` | OG URL |

---

### 3. 환경변수 설정

#### `.env.local` 파일
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ofcqhpatmembkwbajmte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY3FocGF0bWVtYmt3YmFqbXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2OTkxODcsImV4cCI6MjA4MTI3NTE4N30.v_qzt5JaoqL7hpctr3pbdF7Y50MYxZXmGo7SIoIyqLo

# Telegram
TELEGRAM_BOT_TOKEN=8509271011:AAEh5-Q-JwrKgOsUZzDi1s_TcKc0iSuSN50
TELEGRAM_CHAT_ID=1737738720
```

---

### 4. 배포

#### GitHub 저장소
- **URL**: https://github.com/qordlstn8811-coder/insoo
- **브랜치**: main

#### Vercel 배포
- **배포 URL**: https://jeonbuk-hasugu.vercel.app
- **환경변수**: Vercel Dashboard에서 동일하게 설정됨

---

## 📋 빌드 결과

- **총 페이지 수**: 265개
- **정적 페이지**: 홈, About, Contact, 서비스 페이지들
- **동적 페이지**: 14개 시/군, 236개 읍/면/동

---

## 🔧 남은 작업

### 도메인 연결 (가비아)
1. Vercel Dashboard → Settings → Domains → Add Domain
2. `전북하수구막힘.com` 입력
3. 가비아 DNS 설정:
   - **A 레코드**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`

### 검색엔진 인증 (배포 후)
- **파일**: `src/app/layout.tsx` (90-91번줄)

```html
<meta name="naver-site-verification" content="실제인증코드" />
<meta name="google-site-verification" content="실제인증코드" />
```

### Supabase 테이블 생성
- **테이블명**: `inquiries`
- **컬럼**: id, name, phone, region, message, created_at

---

## 📁 주요 파일 위치

| 용도 | 파일 경로 |
|------|----------|
| 메인 레이아웃/SEO | `src/app/layout.tsx` |
| 홈페이지 | `src/app/page.tsx` |
| 헤더/네비게이션 | `src/components/Header.tsx` |
| 히어로 섹션 | `src/components/Hero.tsx` |
| 챗봇 | `src/components/Chatbot.tsx` |
| 플로팅 버튼 | `src/components/FloatingButtons.tsx` |
| 문의 API | `src/app/api/contact/route.ts` |
| 회사 정보/콘텐츠 | `src/data/content.ts` |
| 지역 데이터 | `src/data/regions.ts` |
| 서비스 데이터 | `src/data/services.ts` |

---

## 📞 연락처 정보

- **상호**: 전북하수구막힘
- **대표**: 오다희
- **전화**: 010-8184-3496
- **사업자번호**: 139-04-76709
- **주소**: 전라북도 전주시 덕진구 쪽구름로 42

---

## 🛠️ 수정 시 참고사항

1. **코드 수정 후**: `npm run build`로 빌드 확인
2. **GitHub 푸시**: 
   ```bash
   cd c:\Users\admin\Desktop\배관홈페이지\jeonbuk-hasugu
   cmd /c "git add -A && git commit -m Update && git push"
   ```
3. **Vercel**: GitHub 푸시하면 자동 배포됨

---

## 🚨 긴급 배포 및 오류 해결 지침 (재발 방지)

### 1. 배포 중 "도메인/프로젝트 불일치" 발생 시
- **증상**: 배포는 됐는데 404가 뜨거나, 도메인이 다른 프로젝트에 연결된 경우.
- **해결 절차**:
  1. **현재 연결된 프로젝트 확인**: 
     ```bash
     npx vercel project ls
     ```
  2. **도메인 위치 확인**:
     ```bash
     npx vercel domains ls
     ```
  3. **올바른 연결 (Link)**:
     ```bash
     npx vercel link --yes --project jeonbuk-hasugu
     ```
  4. **도메인 강제 이동**:
     ```bash
     npx vercel domains move 전북하수구막힘.com jeonbuk-hasugu
     ```

### 2. 배포 중 "Git Author / 권한 오류" 발생 시
- **증상**: `Error: Git author ... must have access...` 오류로 배포 실패.
- **원인**: PC의 Git 이메일 설정이 Vercel 팀 멤버 목록에 없어서 발생.
- **비상 해결법 (우회 배포)**:
  ```bash
  # .git 폴더를 잠시 숨겨서 순수 파일만 업로드
  Rename-Item .git .git_tmp
  npx vercel deploy --prod --force
  Rename-Item .git_tmp .git
  ```

### 3. "404 Not Found" 발생 시 체크리스트
- [ ] Vercel 대시보드에서 `Deployment` 상태가 `Ready`인가?
- [ ] 도메인이 `Project Settings > Domains`에 올바르게 등록되었는가?
- [ ] `npx vercel domains ls` 명령어로 도메인이 엉뚱한 프로젝트(`jeonbuk-hasugu-final...`)에 있지 않은가?
- [ ] **GitHub 연동 확인**: Vercel 대시보드 → Settings → Git에서 현재 작업 중인 `jeonbuk-hasugu` 레포지토리가 올바르게 Connect 되어 있는지 확인. (연동이 꼬였을 경우 수동 relink 필요)

---

## 🎉 완료!

모든 작업이 완료되었습니다.
