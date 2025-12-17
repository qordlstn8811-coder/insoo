-- [최종 보안 강화] 이 스크립트를 실행하면 쓰기 권한이 잠깁니다.

-- 1. 블로그 글(posts) 테이블: 일반인 쓰기 권한 제거
drop policy if exists "Public Write Access" on public.posts;
drop policy if exists "Public Update Access" on public.posts;
drop policy if exists "Public Delete Access" on public.posts;

-- 2. 관리자(Service Role) 전용 쓰기 권한 생성
-- API 서버나 관리자 페이지에서 Service Role Key를 쓸 때만 작동합니다.
create policy "Admin Write Access" 
on public.posts for insert 
with check (auth.role() = 'service_role');

create policy "Admin Update Access" 
on public.posts for update 
using (auth.role() = 'service_role');

create policy "Admin Delete Access" 
on public.posts for delete 
using (auth.role() = 'service_role');

-- 참고: 조회(Select) 권한은 "Public Read Access"가 이미 있어서 손대지 않습니다.
-- 참고: 상담문의(inquiries) 테이블은 이미 보안 설정이 완료되어 있습니다.
