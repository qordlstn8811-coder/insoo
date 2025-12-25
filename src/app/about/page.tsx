
import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';

export const metadata: Metadata = {
    title: '업체소개 | 전북하수구막힘',
    description: '전라북도 No.1 배관 전문 업체 전북하수구막힘. 전주, 군산, 익산 등 전라북도 전지역 하수구막힘, 변기막힘, 싱크대막힘 24시 긴급출동. 010-8184-3496',
    keywords: '전북하수구막힘, 전주하수구, 하수구막힘업체, 전북하수구막힘업체, 24시하수구',
    alternates: {
        canonical: 'https://xn--2e0bm8utzck3fsyi7rvktd.com/about',
    },
    openGraph: {
        title: '업체소개 | 전북하수구막힘',
        description: '전라북도 No.1 배관 전문 업체 전북하수구막힘. 10년 이상 경력, 최첨단 장비 보유.',
        url: 'https://xn--2e0bm8utzck3fsyi7rvktd.com/about',
    },
};


export default function AboutPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="bg-blue-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">업체 소개</h1>
                        <p className="text-blue-100">정직과 신뢰로 보답하는 전북하수구막힘입니다.</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* 인사말 섹션 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/worker.png"
                                alt="전북하수구막힘 대표"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">&quot;보이지 않는 곳까지<br />깨끗하게 책임지겠습니다&quot;</h2>
                            <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                <p>
                                    안녕하십니까, 전북하수구막힘을 찾아주신 고객 여러분 진심으로 환영합니다.
                                </p>
                                <p>
                                    저희 전북하수구막힘은 전라북도 전 지역을 대상으로 하수구, 변기, 싱크대 막힘 해결부터
                                    고압세척, 배관 내시경 촬영 등 배관과 관련된 모든 문제를 전문적으로 해결하고 있습니다.
                                </p>
                                <p>
                                    수년간의 현장 경험과 최신 전문 장비를 바탕으로, 타 업체가 포기한 현장도
                                    확실하게 해결해 드리고 있습니다. 단순히 뚫는 것을 넘어 근본적인 원인을 찾아
                                    재발 없는 시공을 약속드립니다.
                                </p>
                                <p>
                                    언제나 고객님의 입장에서 생각하며, 합리적인 비용과 친절한 서비스로
                                    전북 최고의 배관 파트너가 되겠습니다.
                                </p>
                            </div>
                            <div className="mt-8">
                                <div className="font-bold text-lg text-gray-900">전북하수구막힘 임직원 일동</div>
                            </div>
                        </div>
                    </div>

                    {/* 핵심 가치 */}
                    <div className="grid md:grid-cols-3 gap-8 mb-24">
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">확실한 해결</h3>
                            <p className="text-gray-600">
                                최첨단 내시경 장비와 전문 기술력으로 원인을 정확히 파악하여 확실하게 해결해 드립니다.
                                해결하지 못하면 비용을 받지 않습니다.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">신속한 출동</h3>
                            <p className="text-gray-600">
                                전북 전 지역 각 지점을 통해 30분 내 현장에 도착합니다.
                                365일 24시간 언제 배관 문제가 생겨도 즉시 달려갑니다.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:-translate-y-2 transition-transform">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">정직한 가격</h3>
                            <p className="text-gray-600">
                                과도한 추가 요금을 요구하지 않으며, 작업 전 투명하게 비용을 안내해 드립니다.
                                합리적인 가격으로 최고의 서비스를 제공합니다.
                            </p>
                        </div>
                    </div>

                    {/* 팀 사진 */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="grid md:grid-cols-2">
                            <div className="relative h-[300px] md:h-auto">
                                <Image
                                    src="/images/team.png"
                                    alt="전북하수구막힘 팀"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">최고의 전문가들이 함께합니다</h3>
                                <p className="text-gray-600 mb-6">
                                    전북하수구막힘의 모든 기사는 5년 이상의 경력을 보유한 베테랑들입니다.
                                    정기적인 기술 교육과 CS 교육을 통해 기술력은 물론 친절함까지 갖추었습니다.
                                    고객님의 댁을 내 집처럼 소중히 여기며 작업하겠습니다.
                                </p>
                                <a href="tel:010-8184-3496" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors text-center">
                                    전문가와 상담하기
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
