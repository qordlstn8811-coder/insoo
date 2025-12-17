-- 상담문의 테이블 생성
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  region text not null,
  message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 보안 설정 활성화
alter table public.inquiries enable row level security;

-- 누구나 문의를 남길 수 있도록 허용 (INSERT 권한)
create policy "Enable insert for all users" 
on public.inquiries for insert 
with check (true);

-- 관리자(service_role)만 조회 가능하도록 설정 (개인정보 보호)
create policy "Enable select for service_role only" 
on public.inquiries for select 
using (auth.role() = 'service_role');
