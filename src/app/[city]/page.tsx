
import { jeonbukRegions, getAllPaths } from '@/data/regions';
import { serviceContent } from '@/data/content';
import Header from '@/components/Header';
import Link from 'next/link';
import { Metadata } from 'next';

// 정적 경로 생성 (SEO)
export async function generateStaticParams() {
    return jeonbukRegions.map((region) => ({
        city: region.id,
    }));
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
    const { city } = await params;
    const region = jeonbukRegions.find(r => r.id === city);
    const regionName = region?.name || city;

    return {
        title: `${regionName} 하수구막힘 ${regionName} 변기막힘 24시 긴급출동 | 전북하수구막힘`,
        description: `${regionName} 지역 하수구막힘, 싱크대막힘, 변기막힘 전문. 30분내 긴급출동! ${regionName} ${region?.districts.slice(0, 5).join(', ')} 등 전지역 출장. 010-8184-3496`,
        keywords: `${regionName}하수구, ${regionName}변기막힘, ${regionName}싱크대막힘, ${regionName}고압세척, ${regionName}배관청소`,
    };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
    const { city } = await params;
    const region = jeonbukRegions.find(r => r.id === city);

    if (!region) {
        return <div className="min-h-screen flex items-center justify-center">지역을 찾을 수 없습니다.</div>;
    }

    const services = [
        { ...serviceContent.hasugu, key: 'hasugu' },
        { ...serviceContent.sink, key: 'sink' },
        { ...serviceContent.toilet, key: 'toilet' },
        { ...serviceContent.cctv, key: 'cctv' },
    ];

    return (
        <>
            <Header />

            {/* 히어로 섹션 */}
            <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 pt-28 pb-16 lg:pt-36 lg:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
                        <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-blue-200 text-sm font-medium">{region.name} 전지역 24시간 출동</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                        <span className="text-blue-400">{region.name}</span> 하수구막힘<br />
                        싱크대·변기 긴급출동
                    </h1>

                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        {region.name} {region.districts.slice(0, 3).join(', ')} 등 전지역 30분 내 방문!<br />
                        30분 내 긴급출동, 확실하게 뚫어드립니다.
                    </p>

                    <a
                        href="tel:010-8184-3496"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-xl transition-all hover:-translate-y-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        010-8184-3496
                    </a>
                </div>
            </div>

            <main className="bg-slate-50">
                {/* 지역별 상세 */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            {region.name} 지역별 서비스
                        </h2>
                        <p className="text-gray-600">클릭하시면 해당 지역 상세 페이지로 이동합니다</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {region.districts.map((dong) => (
                            <Link
                                key={dong}
                                href={`/${city}/${encodeURIComponent(dong)}`}
                                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg border border-slate-100 text-center hover:border-blue-400 transition-all font-medium text-slate-700 hover:text-blue-600 hover:-translate-y-1"
                            >
                                {dong}
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 서비스 안내 */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                {region.name} 제공 서비스
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {services.map((s) => (
                                <div key={s.key} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="text-3xl mb-4">{s.icon}</div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
                                    <p className="text-slate-600 text-sm">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 지역 설명 - SEO 최적화 콘텐츠 (1500자 이상) */}
                <section className="py-16 bg-blue-50">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">
                                {region.name} 하수구막힘, 왜 전북하수구막힘일까요?
                            </h2>
                            <div className="prose prose-slate max-w-none space-y-4">
                                <p className="text-slate-700 leading-relaxed">
                                    {region.name} 지역에서 <strong>하수구막힘, 싱크대막힘, 변기막힘</strong> 문제로 고민 중이신가요?
                                    전북하수구막힘은 {region.name} 전지역을 대상으로 <strong>24시간 365일 긴급출동 서비스</strong>를 제공하는
                                    전문 배관 업체입니다. {region.districts.slice(0, 5).join(', ')} 등 {region.name} 어느 곳이든
                                    <strong>30분 이내</strong>에 현장에 도착하여 신속하게 문제를 해결해 드립니다.
                                    <strong>해결하지 못하면 비용을 받지 않습니다.</strong>
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 하수구막힘 주요 원인과 해결 방법
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    {region.name} 지역의 하수구막힘은 주로 <strong>기름때, 음식물 찌꺼기, 머리카락, 비누 찌꺼기</strong> 등이
                                    배관 내부에 축적되어 발생합니다. 특히 {region.name} 지역의 오래된 아파트나 빌라의 경우 
                                    배관 노후화로 인한 <strong>석회석 발생</strong>이 주요 원인이 되기도 합니다. 
                                    전북하수구막힘은 <strong>35~40마력 고압세척 장비</strong>와 <strong>HD 배관 내시경 카메라</strong>를 활용하여 
                                    막힘의 정확한 원인을 파악하고, 근본적인 해결을 제공합니다. 단순히 뚫는 것이 아니라 
                                    배관 내부를 깨끗하게 세척하여 재발을 방지합니다.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 변기막힘 긴급 해결
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    변기막힘은 <strong>물티슈, 기저귀, 생리대, 이물질</strong> 등으로 인해 발생하며, 
                                    일상생활에 큰 불편을 초래합니다. {region.name} 지역 어디서든 연락 주시면 
                                    <strong>30분 이내</strong>에 도착하여 변기 손상 없이 안전하게 해결해 드립니다.
                                    특히 아파트나 빌라에서 위층 변기 사용 시 1층에서 역류하는 경우, 
                                    이는 <strong>오수관(공용배관) 막힘</strong>이 원인일 수 있습니다. 
                                    전북하수구막힘은 이러한 복잡한 문제도 정확히 진단하여 해결합니다.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 싱크대막힘 및 주방 배수구 청소
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    주방 싱크대막힘은 <strong>기름 슬러지, 음식물 찌꺼기</strong>가 배관에 쌓여 발생합니다.
                                    특히 음식점, 식당의 경우 기름 사용량이 많아 배관이 자주 막히게 됩니다.
                                    전북하수구막힘은 {region.name} 지역 가정집은 물론 <strong>음식점, 카페, 식당</strong> 등 
                                    상업시설의 싱크대막힘도 전문적으로 해결합니다. 
                                    고압세척으로 배관 내부의 기름때를 완벽히 제거하고, 악취 차단 트랩까지 점검합니다.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 고압세척 및 배관청소 서비스
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    정기적인 <strong>고압세척</strong>은 하수구막힘을 예방하는 가장 효과적인 방법입니다.
                                    전북하수구막힘은 {region.name} 지역 아파트, 빌라, 단독주택, 상가 건물의 
                                    <strong>배관 정기 청소 서비스</strong>를 제공합니다. 1년에 1~2회 정기 세척만으로도 
                                    배관 막힘 걱정 없이 쾌적하게 생활하실 수 있습니다.
                                </p>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 배관 서비스 예상 비용 안내
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <ul className="space-y-2 text-slate-700">
                                        <li>• <strong>하수구막힘</strong>: 50,000원 ~ (현장 상황에 따라 변동)</li>
                                        <li>• <strong>변기막힘</strong>: 50,000원 ~ (이물질 종류에 따라 변동)</li>
                                        <li>• <strong>싱크대막힘</strong>: 50,000원 ~ (기름 슬러지 정도에 따라 변동)</li>
                                        <li>• <strong>고압세척</strong>: 배관 길이 및 상태에 따라 견적</li>
                                        <li>• <strong>배관내시경</strong>: 점검 범위에 따라 견적</li>
                                    </ul>
                                    <p className="text-sm text-slate-500 mt-3">
                                        ※ 정확한 비용은 현장 확인 후 안내드립니다. 출장비, 상담비 무료!
                                    </p>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    전북하수구막힘을 선택해야 하는 이유
                                </h3>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>{region.name} 전담팀 운영</strong> - {region.name} 지역 특성을 잘 아는 10년 이상 경력의 전문 기술자가 신속하게 방문합니다.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>최신 장비 보유</strong> - 35~40마력 고압세척기, HD 배관 내시경, 전동 스프링, 석션 펌프 등 최신 장비를 갖추고 있습니다.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>투명한 정찰제 가격</strong> - 작업 전 정확한 견적을 안내드리며, 추가 비용 걱정이 없습니다. 바가지 요금 없습니다.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>1년 무상 A/S 보장</strong> - 같은 문제로 재발 시 무상으로 다시 방문하여 해결해 드립니다.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span><strong>24시간 365일 긴급출동</strong> - 새벽, 주말, 공휴일 관계없이 언제든 연락 주시면 즉시 출동합니다.</span>
                                    </li>
                                </ul>

                                <h3 className="text-lg font-bold text-slate-800 mt-6">
                                    {region.name} 서비스 가능 지역
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    전북하수구막힘은 {region.name} 전지역에 서비스를 제공합니다. 
                                    <strong>{region.districts.join(', ')}</strong> 등 
                                    {region.name} 어디서든 30분 이내 방문이 가능합니다.
                                </p>

                                <div className="bg-blue-600 text-white p-6 rounded-xl mt-6 text-center">
                                    <p className="text-lg mb-2">
                                        {region.name} 하수구막힘, 변기막힘, 싱크대막힘 문제?
                                    </p>
                                    <p className="text-3xl font-bold mb-2">
                                        📞 010-8184-3496
                                    </p>
                                    <p className="text-blue-100">
                                        지금 바로 전화주세요! 24시간 상담 가능
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 다른 지역 링크 */}
                <section className="py-12 bg-white border-t">
                    <div className="max-w-7xl mx-auto px-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">다른 지역 보기</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            {jeonbukRegions.filter(r => r.id !== city).map((r) => (
                                <Link
                                    key={r.id}
                                    href={`/${r.id}`}
                                    className="px-4 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-full text-sm font-medium transition-colors"
                                >
                                    {r.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
