
import { jeonbukRegions } from '@/data/regions';
import { serviceContent } from '@/data/content';
import { generateRegionSEOContent, reviews } from '@/data/reviews';
import Header from '@/components/Header';
import Link from 'next/link';
import { Metadata } from 'next';

// 정적 경로 생성 (모든 동/읍/면)
export async function generateStaticParams() {
    const paths = [];
    for (const region of jeonbukRegions) {
        for (const dong of region.districts) {
            paths.push({
                city: region.id,
                dong: dong,
            });
        }
    }
    return paths;
}

// 동적 메타데이터
export async function generateMetadata({ params }: { params: Promise<{ city: string; dong: string }> }): Promise<Metadata> {
    const { city, dong } = await params;
    const region = jeonbukRegions.find(r => r.id === city);
    const regionName = region?.name || city;
    const dongName = decodeURIComponent(dong);

    return {
        title: `${dongName} 하수구막힘 싱크대·변기뚫음 24시 긴급출동 | 30분 내 방문`,
        description: `${regionName} ${dongName} 지역 하수구막힘, 싱크대막힘, 변기막힘 24시 긴급출동. 최신 장비로 확실하게 해결! 010-8184-3496`,
        keywords: `${dongName}하수구, ${dongName}변기막힘, ${regionName} ${dongName}, ${dongName}싱크대막힘, ${dongName}고압세척`,
        alternates: {
            canonical: `https://xn--2e0bm8utzck3fsyi7rvktd.com/${city}/${dong}`,
        },
    };
}

export default async function DongPage({ params }: { params: Promise<{ city: string; dong: string }> }) {
    const { city, dong } = await params;
    const region = jeonbukRegions.find(r => r.id === city);
    const regionName = region?.name || city;
    const dongName = decodeURIComponent(dong);

    // SEO 콘텐츠 생성
    const seoContent = generateRegionSEOContent(regionName, dongName);

    // 해당 지역(동) 우수 후기 우선 노출, 없으면 시 단위 후기 노출
    const dongReviews = reviews.filter(r => r.dong.includes(dongName.replace('1동', '').replace('2동', '').replace('3동', '').replace('4동', '').replace('5동', '')) ||
        dongName.includes(r.dong));
    const regionReviews = reviews.filter(r => r.region.includes(regionName.replace('시', '').replace('군', '')));

    // 동 후기가 있으면 동 후기 우선, 부족하면 시 후기로 채움
    let displayReviews = [...dongReviews];
    if (displayReviews.length < 2) {
        const additionalReviews = regionReviews.filter(r => !displayReviews.find(dr => dr.id === r.id));
        displayReviews = [...displayReviews, ...additionalReviews];
    }

    // 최종 2개 노출
    displayReviews = displayReviews.length > 0 ? displayReviews.slice(0, 2) : reviews.slice(0, 2);

    return (
        <>
            <Header />

            {/* 히어로 */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 pt-28 pb-12 lg:pt-36 lg:pb-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <nav className="text-blue-300 text-sm mb-4">
                        <Link href="/" className="hover:text-white">홈</Link>
                        <span className="mx-2">›</span>
                        <Link href={`/${city}`} className="hover:text-white">{regionName}</Link>
                        <span className="mx-2">›</span>
                        <span className="text-white">{dongName}</span>
                    </nav>

                    <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
                        <span className="text-blue-400">{regionName} {dongName}</span><br />
                        하수구막힘 · 변기막힘 전문
                    </h1>

                    <p className="text-gray-300 mb-6">
                        {dongName} 지역 30분 내 긴급출동! 최신 장비로 확실하게 해결합니다.
                    </p>

                    <a
                        href="tel:010-8184-3496"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all"
                    >
                        📞 010-8184-3496
                    </a>
                </div>
            </div>

            <main className="bg-slate-50 py-12">
                <div className="max-w-4xl mx-auto px-4">

                    {/* SEO 콘텐츠 섹션 */}
                    <article className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8">
                        <div className="bg-blue-600 px-6 py-5">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                {regionName} {dongName} 하수구 고압세척 / 변기막힘 전문
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">우리 동네 가장 빠른 배관 전문 업체</p>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {/* 소개글 (SEO) */}
                            <section>
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {seoContent.intro}
                                </p>
                            </section>

                            {/* 서비스별 상세 설명 (SEO) */}
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">🔧 {dongName} 전문 서비스</h3>
                                <div className="space-y-6">
                                    {seoContent.services.map((service, i) => (
                                        <div key={i} className="bg-slate-50 p-5 rounded-xl">
                                            <h4 className="font-bold text-lg mb-2 text-blue-700">{service.title}</h4>
                                            <p className="text-slate-600 leading-relaxed">{service.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 고객 후기 (SEO) */}
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">⭐ 고객 후기</h3>
                                <div className="space-y-4">
                                    {displayReviews.map((review) => (
                                        <div key={review.id} className="bg-gradient-to-r from-blue-50 to-slate-50 p-5 rounded-xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{review.name}</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ 인증됨</span>
                                                </div>
                                                <div className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}</div>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed">"{review.content}"</p>
                                            <div className="mt-2 text-xs text-slate-500">{review.region} {review.dong} · {review.service} · {review.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 왜 저희인가 (SEO) */}
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">💪 왜 전북하수구막힘인가요?</h3>
                                <p className="text-slate-700 leading-relaxed mb-4">
                                    {seoContent.whyUs}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['24시간 긴급출동', '투명한 정찰제', '30분 내 방문', '무상 A/S'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-slate-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 작업 과정 */}
                            <section>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">📋 작업 과정</h3>
                                <div className="space-y-3">
                                    {[
                                        '전화 상담 및 긴급 출동 (30분 내)',
                                        '최신 내시경 장비로 원인 분석',
                                        '전문 장비를 이용한 통수 작업',
                                        '작업 후 배수 테스트 및 확인'
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                                            <span className="bg-blue-600 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm flex-shrink-0">{i + 1}</span>
                                            <span className="text-slate-700">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 마무리 CTA (SEO) */}
                            <section className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
                                <h3 className="text-xl font-bold mb-2">지금 바로 연락하세요!</h3>
                                <p className="text-blue-100 mb-4">
                                    {seoContent.contact}
                                </p>
                                <a href="tel:010-8184-3496" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                    📞 010-8184-3496
                                </a>
                            </section>
                        </div>
                    </article>

                    {/* 같은 지역 다른 동 */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border">
                        <h3 className="font-bold text-gray-900 mb-4">{regionName} 다른 지역</h3>
                        <div className="flex flex-wrap gap-2">
                            {region?.districts.filter(d => d !== dongName).slice(0, 15).map((d) => (
                                <Link
                                    key={d}
                                    href={`/${city}/${encodeURIComponent(d)}`}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-full text-sm transition-colors"
                                >
                                    {d}
                                </Link>
                            ))}
                            {(region?.districts.length || 0) > 15 && (
                                <Link href={`/${city}`} className="px-3 py-1.5 text-blue-600 text-sm font-medium">
                                    + 더보기
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
