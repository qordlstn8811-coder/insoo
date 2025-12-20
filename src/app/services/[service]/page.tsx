
import { serviceDetails } from '@/data/services';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';

// 동적 파라미터 타입 생성
export function generateStaticParams() {
    return Object.keys(serviceDetails).map((service) => ({
        service: service,
    }));
}

// SEO 키워드 매핑
const seoKeywords: Record<string, string> = {
    hasugu: '전주하수구막힘, 군산하수구막힘, 익산하수구막힘, 하수구뚫는곳, 24시하수구, 하수구고압세척',
    sink: '전주싱크대막힘, 군산싱크대막힘, 익산싱크대막힘, 싱크대뚫는곳, 주방배수구막힘',
    toilet: '전주변기막힘, 군산변기막힘, 익산변기막힘, 변기뚫는곳, 양변기막힘, 24시변기막힘',
    highpressure: '전주고압세척, 하수구고압세척, 배관세척, 배관청소, 고압세척업체',
    cctv: '전주배관내시경, 배관CCTV, 배관카메라, 배관진단, 배관점검'
};

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
    const { service: serviceParam } = await params;
    const service = serviceDetails[serviceParam as keyof typeof serviceDetails];

    if (!service) {
        return {
            title: '서비스를 찾을 수 없습니다',
        };
    }

    const keywords = seoKeywords[serviceParam] || '';

    return {
        title: `${service.title} | 전주 ${service.title} 24시 긴급출동 - 전북하수구막힘`,
        description: `전주, 군산, 익산 ${service.title} 24시 긴급출동! ${service.description} 합리적인 정찰제 가격. 010-8184-3496`,
        keywords: keywords,
        openGraph: {
            title: `${service.title} | 전북하수구막힘 - 전주 ${service.title} 전문`,
            description: `전주, 군산, 익산 ${service.title} 24시 긴급출동! ${service.description}`,
            url: `https://전북하수구막힘.com/services/${serviceParam}`,
            images: [{ url: service.image }],
        },
    };
}


export default async function ServiceDetail({ params }: { params: Promise<{ service: string }> }) {
    const { service: serviceParam } = await params;
    const service = serviceDetails[serviceParam as keyof typeof serviceDetails];

    if (!service) {
        notFound();
    }


    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-20">
                {/* 히어로 섹션 */}
                <div className="bg-blue-900 text-white py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.title}</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">{service.description}</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* 이미지 섹션 */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px]">
                            <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* 정보 섹션 */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">서비스 특징</h2>
                            <ul className="space-y-4 mb-8">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-lg text-gray-700">
                                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <h2 className="text-3xl font-bold text-gray-900 mb-6">작업 진행 과정</h2>
                            <div className="space-y-6">
                                {service.process.map((step, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </div>
                                        <p className="text-lg text-gray-700 pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-bold mb-2">예상 비용</div>
                                <div className="text-3xl font-extrabold text-blue-900">{service.price}</div>
                                <p className="text-sm text-gray-500 mt-2">* 현장 상황에 따라 변동될 수 있습니다.</p>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <a href="tel:010-8184-3496" className="flex-1 bg-blue-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg">
                                    전화 상담하기
                                </a>
                                <Link href="/contact" className="flex-1 bg-white text-blue-600 border-2 border-blue-100 text-center py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors">
                                    온라인 문의
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
