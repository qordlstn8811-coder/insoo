'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocalKeywordGrid from '@/components/LocalKeywordGrid';

interface ServiceDetail {
    title: string;
    description: string;
    image: string;
}

interface Region {
    id: string;
    name: string;
}

interface FAQ {
    question: string;
    answer: string;
}

interface CompanyInfo {
    name: string;
    representative: string;
    businessNumber: string;
    address: string;
    copyright: string;
}

interface AnimatedMainContentProps {
    serviceDetails: Record<string, ServiceDetail>;
    jeonbukRegions: Region[];
    faqContent: FAQ[];
    companyInfo: CompanyInfo;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    },
};

export default function AnimatedMainContent({
    serviceDetails,
    jeonbukRegions,
    faqContent,
    companyInfo
}: AnimatedMainContentProps) {
    return (
        <main className="bg-slate-50">
            {/* 2. Problem Section (문제 제기) */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            <motion.span
                                className="text-blue-400"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                배관 문제
                            </motion.span>
                            , 더 이상 참지 마세요
                        </h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
                            방치할수록 공사 비용과 시간은 늘어납니다.<br className="hidden md:block" />
                            지금 겪고 계신 문제를 확인해보세요.
                        </p>

                        {/* 신뢰 지표 (Trust Badges) */}
                        <motion.div
                            className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            {[
                                { label: '30분 긴급출동', icon: '⚡' },
                                { label: '1년 무상 A/S', icon: '🛡️' },
                                { label: '정찰제 가격표', icon: '📋' },
                                { label: '최첨단 장비보유', icon: '🔬' }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                                    <span className="text-xl">{badge.icon}</span>
                                    <span className="text-sm font-bold text-white">{badge.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        {[
                            {
                                title: '꽉 막힌 배수구',
                                desc: '물이 시원하게 내려가지 않고 역류하여 일상생활에 지장을 줍니다.',
                                icon: (
                                    <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                color: 'red'
                            },
                            {
                                title: '참을 수 없는 악취',
                                desc: '싱크대와 화장실에서 올라오는 정체불명의 냄새가 집안을 메웁니다.',
                                icon: (
                                    <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                ),
                                color: 'yellow'
                            },
                            {
                                title: '반복되는 재발',
                                desc: '동네 업체를 불러 뚫었지만 며칠 뒤 똑같은 문제가 또 발생합니다.',
                                icon: (
                                    <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                ),
                                color: 'orange'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors group"
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.03,
                                    y: -5,
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                <motion.div
                                    className="mb-6 bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center"
                                    whileHover={{ scale: 1.2, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 3. Solution Section (해결책) */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <motion.span
                            className="text-blue-600 font-bold tracking-widest uppercase mb-2 block"
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            OUR SOLUTION
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            전북하수구막힘만의 <span className="text-blue-600">확실한 해결책</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {Object.entries(serviceDetails).map(([key, s]) => (
                            <motion.div
                                key={key}
                                variants={itemVariants}
                                whileHover={{ y: -10 }}
                            >
                                <Link
                                    href={`/services/${key}`}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-slate-100 block h-full"
                                >
                                    <motion.div
                                        className="relative aspect-video overflow-hidden"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10" />
                                        <Image
                                            src={s.image}
                                            alt={s.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </motion.div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {s.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                            {s.description}
                                        </p>
                                        <div className="flex items-center text-blue-600 font-bold text-sm">
                                            자세히 보기
                                            <motion.svg
                                                className="w-4 h-4 ml-1"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                whileHover={{ x: 5 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </motion.svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl font-bold text-gray-900">자주 묻는 질문</h2>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqContent.map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                >
                                    <AccordionItem value={`faq-${i}`} className="bg-white rounded-xl shadow-sm border-none">
                                        <AccordionTrigger className="p-6 text-lg font-bold text-slate-800 hover:no-underline">
                                            Q. {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6 text-slate-600 leading-relaxed">
                                            A. {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>

            {/* 5. Region Section */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">전북 전 지역 출장 가능</h2>
                        <p className="text-slate-500">어디든 30분 내로 달려갑니다.</p>
                    </motion.div>
                    <motion.div
                        className="flex flex-wrap justify-center gap-2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={containerVariants}
                    >
                        {jeonbukRegions.map((region, i) => (
                            <motion.div
                                key={region.id}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.8 },
                                    visible: { opacity: 1, scale: 1, transition: { delay: i * 0.03 } }
                                }}
                                whileHover={{ scale: 1.1 }}
                            >
                                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors cursor-pointer" asChild>
                                    <Link href={`/${region.id}`}>
                                        {region.name}
                                    </Link>
                                </Badge>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 왜 저희인가 섹션 */}
            <section className="py-16 md:py-24 bg-gradient-to-br from-blue-900 to-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 전북하수구막힘인가요?</h2>
                        <p className="text-blue-200 max-w-2xl mx-auto">
                            하수구업체 전북하수구막힘은 공정한 가격정책과 신속하고 정확한 진단을 통해 최상의 만족감을 드립니다.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            { title: '24시간 긴급출동', desc: '밤낮 상관없이 연락주시면 30분 내에 현장에 도착합니다.', icon: '⏰' },
                            { title: '투명한 가격', desc: '작업 전 정확한 견적을 안내드리며, 추가 비용은 없습니다.', icon: '💰' },
                            { title: '확실한 A/S', desc: '같은 문제로 재발 시 무상으로 다시 해결해 드립니다.', icon: '🛡️' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="text-center p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.05,
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
                                }}
                            >
                                <motion.div
                                    className="text-4xl mb-4"
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                >
                                    {item.icon}
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-blue-200">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 지역 키워드 그리드 (SEO 최적화) */}
            <LocalKeywordGrid />

            {/* CTA 섹션 */}
            <section className="py-16 bg-white">
                <motion.div
                    className="max-w-4xl mx-auto px-4 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        지금 바로 상담받으세요
                    </h2>
                    <p className="text-gray-600 mb-8">
                        전화 한 통이면 전문 상담원이 친절하게 안내해 드립니다.
                    </p>
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                            boxShadow: [
                                '0 0 0 0 rgba(59, 130, 246, 0.4)',
                                '0 0 0 20px rgba(59, 130, 246, 0)',
                                '0 0 0 0 rgba(59, 130, 246, 0)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-block rounded-2xl"
                    >
                        <Button size="lg" className="px-10 py-6 text-xl font-bold shadow-xl shadow-blue-200 hover:scale-105 transition-all" asChild>
                            <a href="tel:010-8184-3496" className="inline-flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                010-8184-3496
                            </a>
                        </Button>
                    </motion.div>
                </motion.div>
            </section>

            {/* 푸터 */}
            <footer className="bg-slate-900 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="grid md:grid-cols-4 gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div>
                            <div className="text-2xl font-bold text-white mb-4">전북<span className="text-blue-400">하수구막힘</span></div>
                            <p className="text-sm">전라북도 전지역 하수구막힘, 싱크대막힘, 변기막힘 24시 긴급출동공정한 가격정책과 확실한 사후관리 서비스를 제공합니다.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">서비스 지역</h4>
                            <div className="flex flex-wrap gap-2 text-sm">
                                {jeonbukRegions.slice(0, 7).map(r => (
                                    <Link key={r.id} href={`/${r.id}`} className="hover:text-blue-400 transition-colors">{r.name}</Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">연락처</h4>
                            <p className="text-lg font-bold text-blue-400">010-8184-3496</p>
                            <p className="text-sm mt-2">24시간 상담 가능</p>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                            <h4 className="text-white font-bold mb-4">사업자 정보</h4>
                            <div className="text-sm space-y-1">
                                <p>상호: {companyInfo.name}</p>
                                <p>대표: {companyInfo.representative}</p>
                                <p>사업자등록번호: {companyInfo.businessNumber}</p>
                                <p>주소: {companyInfo.address}</p>
                            </div>
                        </div>
                    </motion.div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
                        {companyInfo.copyright}
                    </div>
                </div>
            </footer>
        </main>
    );
}
