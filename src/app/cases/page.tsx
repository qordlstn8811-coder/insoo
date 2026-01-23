import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { Metadata } from 'next';
import { unstable_cache } from 'next/cache';

export const metadata: Metadata = {
    title: '시공사례 | 전북하수구막힘',
    description: '전북하수구막힘의 생생한 현장 시공 사례를 확인하세요. 변기, 하수구, 싱크대 막힘 해결 전문가.',
    alternates: {
        canonical: 'https://전북하수구막힘.com/cases',
    },
};

// 동적 데이터 페이징 설정 (캐시 방식)
const PAGE_SIZE = 12;
const CACHE_SECONDS = 60;

const isPollinationsUrl = (value: string) =>
    value && value.startsWith('https://image.pollinations.ai/');
const BLUR_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNyIgdmlld0JveD0iMCAwIDEwIDciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjciIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

const getSafeImageUrl = (url: string | null): string => {
    if (!url || url.trim().length === 0) return '/images/hero.png';
    if (isPollinationsUrl(url)) return '/images/hero.png';
    return url;
};

// 페이지별 캐시 함수
const getPostsPageData = unstable_cache(
    async (page: number) => {
        const supabase = createClient();
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: posts } = await supabase
            .from('posts')
            .select('id,title,content,created_at,image_url,category,keyword')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .range(from, to);

        return posts ?? [];
    },
    ['cases-posts-page'],
    { revalidate: CACHE_SECONDS }
);

// 총 개수 조회 함수
const getTotalCount = unstable_cache(
    async () => {
        const supabase = createClient();
        const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published');
        return count ?? 0;
    },
    ['cases-total-count'],
    { revalidate: CACHE_SECONDS }
);

export const revalidate = 60;

type CasesPageProps = {
    searchParams?: Promise<{
        page?: string;
    }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
    const params = await searchParams;
    const page = Math.max(1, Number(params?.page ?? '1') || 1);

    // 게시글 및 총 개수 가져오기
    const [posts, totalCount] = await Promise.all([
        getPostsPageData(page),
        getTotalCount()
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    // 페이지 번호 범위 계산 (현재 페이지 기준 최대 10개)
    const maxVisiblePages = 10;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    startPage = Math.max(1, endPage - maxVisiblePages + 1);

    return (
        <main className="min-h-screen bg-gray-50 pb-20 pt-24">
            {/* 상단 배너 */}
            <section className="bg-blue-900 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
                <h1 className="mb-4 text-3xl font-extrabold md:text-5xl">
                    생생한 시공 현장
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-blue-100">
                    전북하수구막힘이 직접 해결한 다양한 현장 이야기를 만나보세요.<br />
                    고객님의 고민과 비슷한 사례를 찾아보다 좋습니다.
                </p>
            </section>

            {/* 게시글 그리드 */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {!posts || posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
                        <div className="mb-4 text-6xl">📋</div>
                        <h3 className="text-xl font-bold text-gray-900">아직 등록된 시공사례가 없습니다.</h3>
                        <p className="mt-2 text-gray-500">곧 새로운 현장 이야기로 찾아뵙겠습니다!</p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/cases/${post.id}`}
                                prefetch={false}
                                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                {/* 이미지 영역 */}
                                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                    {post.image_url ? (
                                        <SafeImage
                                            src={getSafeImageUrl(post.image_url)}
                                            alt={post.title}
                                            fill
                                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            placeholder="blur"
                                            blurDataURL={BLUR_DATA_URL}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                            No Image
                                        </div>
                                    )}
                                    {/* 카테고리 뱃지 */}
                                    <div className="absolute left-4 top-4 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                                        {post.category || '시공사례'}
                                    </div>
                                </div>

                                {/* 텍스트 영역 */}
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                                        <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                                        <span>·</span>
                                        <span>{post.keyword || '배관서비스'}</span>
                                    </div>
                                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-blue-600">
                                        {post.title}
                                    </h2>
                                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">
                                        {post.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                                    </p>
                                    <div className="mt-auto flex items-center font-medium text-blue-600">
                                        자세히 보기
                                        <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                        {/* 이전 버튼 */}
                        {hasPrevPage ? (
                            <Link
                                href={`/cases?page=${page - 1}`}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-blue-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-300 opacity-50 cursor-not-allowed">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        )}

                        {/* 페이지 번호 (동적) */}
                        {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                            const pageNum = startPage + i;
                            const isActive = page === pageNum;
                            return (
                                <Link
                                    key={pageNum}
                                    href={`/cases?page=${pageNum}`}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border font-medium transition ${isActive
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}

                        {/* 다음 버튼 */}
                        {hasNextPage ? (
                            <Link
                                href={`/cases?page=${page + 1}`}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-blue-600"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-300 opacity-50 cursor-not-allowed">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}

                {/* 총 페이지 정보 */}
                {totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                        {page} / {totalPages} 페이지 (총 {totalCount}개)
                    </div>
                )}
            </div>
        </main>
    );
}
