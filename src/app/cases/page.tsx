import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '시공사례 | 전북하수구막힘',
    description: '전북하수구막힘의 생생한 현장 시공 사례를 확인하세요. 변기, 하수구, 싱크대 막힘 해결 후기.',
    alternates: {
        canonical: 'https://전북하수구막힘.com/cases',
    },
};

// 동적 데이터 페칭 설정 (캐시 방지)
export const revalidate = 0;

export default async function CasesPage() {

    const supabase = createClient();
    // 게시글 가져오기 (최신순)
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-gray-50 pb-20 pt-24">
            {/* 상단 배너 */}
            <section className="bg-blue-900 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
                <h1 className="mb-4 text-3xl font-extrabold md:text-5xl">
                    생생한 시공 현장
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-blue-100">
                    전북하수구막힘이 직접 해결한 다양한 현장 이야기를 만나보세요.<br />
                    고객님의 고민과 비슷한 사례를 찾아보실 수 있습니다.
                </p>
            </section>

            {/* 게시글 그리드 */}
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {!posts || posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
                        <div className="mb-4 text-6xl">📝</div>
                        <h3 className="text-xl font-bold text-gray-900">아직 등록된 시공사례가 없습니다.</h3>
                        <p className="mt-2 text-gray-500">곧 새로운 현장 이야기로 찾아뵙겠습니다!</p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/cases/${post.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                {/* 이미지 영역 */}
                                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                    {post.image_url ? (
                                        <SafeImage
                                            src={post.image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                                        <span>•</span>
                                        <span>{post.keyword || '배관설비'}</span>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m-4-4h14" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
