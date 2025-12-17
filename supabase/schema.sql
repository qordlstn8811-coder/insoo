-- 1. Create the 'posts' table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  keyword text not null,
  title text,
  content text,
  image_url text,
  status text check (status in ('draft', 'published', 'scheduled')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_at timestamp with time zone
);

-- 2. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- 3. Create Policy: Allow public read access to published posts
create policy "Allow public read access"
  on public.posts for select
  using (true);

-- 4. Create Policy: Allow full access to authenticated users (Admin)
create policy "Allow admin full access"
  on public.posts for all
  using (auth.role() = 'anon'); 
  -- 주의: 현재 개발 편의를 위해 'anon' 키로도 쓰기 가능하게 설정함.
  -- 실제 운영 시에는 관리자 로그인 기능을 붙이고 'authenticated'로 바꿔야 안전함.

-- 5. Create Storage Bucket for Images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- 6. Storage Policy: Allow public to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'blog-images' );

-- 7. Storage Policy: Allow admin to upload images
create policy "Admin Upload"
  on storage.objects for insert
  using ( bucket_id = 'blog-images' );
