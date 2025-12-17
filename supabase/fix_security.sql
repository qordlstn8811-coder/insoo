-- [중요] 이 스크립트를 Supabase SQL Editor에서 실행 'Run' 하세요.

-- 1. 블로그 글(posts) 테이블 보안(RLS) 활성화
-- 경고 메시지 해결을 위해 RLS를 켭니다.
alter table public.posts enable row level security;

-- 기존 정책이 있다면 삭제하고 다시 생성 (충돌 방지)
drop policy if exists "Allow public read access" on public.posts;
drop policy if exists "Allow admin full access" on public.posts;
drop policy if exists "Public Read Access" on public.posts;
drop policy if exists "Public Write Access" on public.posts;

-- 정책 1: 누구나 블로그 글을 볼 수 있음 (조회 허용)
create policy "Public Read Access"
on public.posts for select
using (true);

-- 정책 2: (개발용) 누구나/관리자가 글을 쓰고 수정할 수 있음
-- 주의: 실제 서비스 런칭 전에는 이 부분을 '관리자만' 가능하게 수정해야 합니다.
create policy "Public Write Access"
on public.posts for insert
with check (true);

create policy "Public Update Access"
on public.posts for update
using (true);

create policy "Public Delete Access"
on public.posts for delete
using (true);


-- 2. 상담문의(inquiries) 테이블 체크 및 보안 설정
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  region text not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inquiries enable row level security;

drop policy if exists "Enable insert for all users" on public.inquiries;
drop policy if exists "Enable select for service_role only" on public.inquiries;

-- 상담문의는 누구나 등록 가능
create policy "Enable insert for all users" 
on public.inquiries for insert 
with check (true);

-- 상담문의 조회는 관리자(service_role)만 가능
create policy "Enable select for service_role only" 
on public.inquiries for select 
using (auth.role() = 'service_role');
