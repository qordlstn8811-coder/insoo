import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// 동적 메타데이터 생성 (SEO)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();

    if (!post) {
        return {
            title: '게시글을 찾을 수 없습니다',
        };
    }

    const cleanDescription = post.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || '';
    const keywords = [
        post.keyword,
        '전북배관',
        '전북 하수구막힘',
        '전주 배관청소',
        '군산 싱크대막힘',
        '익산 변기막힘',
        '배관 전문업체',
        '24시간 긴급출동',
        '전북 전 지역 출장'
    ].join(', ');

    return {
        title: `${post.title} | 전북배관 시공사례`,
        description: cleanDescription,
        keywords: keywords,
        authors: [{ name: '전북배관' }],
        creator: '전북배관',
        publisher: '전북배관',
        alternates: {
            canonical: `https://xn--2e0bm8utzck3fsyi7rvktd.com/cases/${id}`
        },
        openGraph: {
            title: post.title,
            description: cleanDescription,
            url: `https://xn--2e0bm8utzck3fsyi7rvktd.com/cases/${id}`,
            siteName: '전북배관',
            images: post.image_url ? [{
                url: post.image_url,
                width: 1200,
                height: 630,
                alt: post.title
            }] : [],
            locale: 'ko_KR',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: cleanDescription,
            images: post.image_url ? [post.image_url] : [],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
            },
        },
    };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <main className="container mx-auto min-h-screen max-w-4xl px-4 py-12 pb-24">
            {/* JSON-LD 구조화된 데이터 (네이버 SEO) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: post.title,
                        description: post.content?.substring(0, 160).replace(/<[^>]*>?/gm, ''),
                        image: post.image_url,
                        datePublished: post.created_at,
                        dateModified: post.created_at,
                        author: {
                            '@type': 'Organization',
                            name: '전북배관',
                            url: 'https://xn--2e0bm8utzck3fsyi7rvktd.com',
                            telephone: '010-8184-3496',
                            address: {
                                '@type': 'PostalAddress',
                                addressRegion: '전북',
                                addressCountry: 'KR'
                            }
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: '전북배관',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://xn--2e0bm8utzck3fsyi7rvktd.com/icon.png'
                            }
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': `https://xn--2e0bm8utzck3fsyi7rvktd.com/cases/${post.id}`
                        },
                        keywords: `${post.keyword}, 전북배관, 배관막힘, 하수구막힘, 긴급출동`
                    })
                }}
            />

            {/* 네비게이션 */}
            <div className="mb-8">
                <Link href="/cases" className="text-sm font-medium text-gray-500 hover:text-blue-600">
                    ← 목록으로 돌아가기
                </Link>
            </div>

            <article>
                {/* 헤더 */}
                <header className="mb-10 text-center">
                    <div className="mb-4 flex justify-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
                            {post.category || '시공사례'}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </span>
                    </div>
                    <h1 className="mb-8 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                        {post.title}
                    </h1>
                    {post.image_url && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg">
                            <Image
                                src={post.image_url}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                </header>

                {/* 본문 */}
                <div
                    className="prose prose-lg prose-blue mx-auto max-w-none bg-white p-0 md:p-8"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />

                {/* 하단 상담 유도 */}
                <div className="mt-16 rounded-2xl bg-blue-50 p-8 text-center ring-1 ring-blue-100">
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">비슷한 문제로 고민 중이신가요?</h3>
                    <p className="mb-6 text-gray-600">전북배관이 30분 내로 방문하여 시원하게 해결해 드립니다.</p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <a href="tel:010-8184-3496" className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700">
                            📞 010-8184-3496 전화 상담
                        </a>
                        <a href="sms:010-8184-3496" className="rounded-xl bg-white px-8 py-3 text-lg font-bold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50">
                            📲 문자 문의하기
                        </a>
                    </div>
                </div>
            </article>
        </main>
    );
}
