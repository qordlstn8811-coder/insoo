'use client';

import Image from 'next/image';
import { mainContent } from '@/data/content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Spotlight } from '@/components/ui/spotlight';
import { WavyBackground } from '@/components/ui/wavy-background';

export default function Hero() {
    return (
        <div className="relative overflow-hidden min-h-screen">
            <WavyBackground
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-40 lg:pb-0"
                containerClassName="bg-slate-900 min-h-screen"
                colors={["#3b82f6", "#06b6d4", "#8b5cf6", "#ec4899"]}
                waveWidth={50}
                blur={10}
            >
                {/* Spotlight 효과 - WavyBackground 내부 또는 위에 배치 */}
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20 z-20"
                    fill="white"
                />

                <div className="grid lg:grid-cols-2 gap-12 items-center h-full pt-32 lg:pt-0">
                    {/* 텍스트 콘텐츠 */}
                    <div className="text-center lg:text-left z-20">
                        {/* 배지 */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Badge variant="outline" className="inline-flex items-center gap-2 bg-blue-500/20 border-blue-400/30 text-blue-200 px-4 py-2 mb-6 text-sm backdrop-blur-md">
                                <motion.span
                                    className="w-2 h-2 bg-green-400 rounded-full"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                전북 전지역 24시간 긴급출동
                            </Badge>
                        </motion.div>

                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <motion.span
                                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 mb-2 text-xl md:text-2xl lg:text-3xl font-bold"
                                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                style={{ backgroundSize: '200% auto' }}
                            >
                                {mainContent.hero.title}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                                className="block"
                            >
                                막힌 곳 시원하게
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"
                            >
                                뚫어드립니다!
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            className="mt-4 max-w-xl text-lg md:text-xl text-gray-200 mb-8 mx-auto lg:mx-0 font-medium"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                        >
                            {mainContent.hero.description}
                        </motion.p>

                        {/* CTA 버튼들 */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                        >
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
                                className="rounded-xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-6 text-lg font-bold shadow-2xl shadow-blue-500/40" asChild>
                                    <a href="tel:010-8184-3496" className="flex items-center justify-center gap-3">
                                        <motion.svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </motion.svg>
                                        010-8184-3496
                                    </a>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* 특징 배지들 */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-3 text-white text-sm font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.6 }}
                        >
                            {mainContent.features.slice(0, 3).map((feat, i) => (
                                <motion.div
                                    key={i}
                                    className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl py-3 px-3 border border-white/20 hover:bg-white/20 transition-colors"
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 1.7 + i * 0.15 }}
                                >
                                    <span className="text-green-300">✓</span>
                                    <span className="truncate">{feat}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* 팀/차량 이미지 */}
                    <motion.div
                        className="hidden lg:block z-20"
                        initial={{ opacity: 0, x: 80, rotate: 5 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.6, type: 'spring' }}
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Image
                                    src="/images/van.png"
                                    alt="전북배관 서비스 차량"
                                    width={600}
                                    height={400}
                                    className="rounded-3xl shadow-2xl border-4 border-white/10"
                                />
                            </motion.div>

                            {/* 플로팅 카드 - 긴급출동 */}
                            <motion.div
                                className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5"
                                initial={{ opacity: 0, x: -30, y: 30 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.4 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="bg-gradient-to-br from-green-400 to-green-500 p-3 rounded-xl"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-lg">24시간 긴급출동</div>
                                        <div className="text-sm text-gray-500">30분 내 현장 도착</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* 플로팅 카드 - 실시간 예약 */}
                            <motion.div
                                className="absolute top-1/2 -right-16 bg-gradient-to-r from-blue-600 to-blue-700/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 text-white"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 1.8 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className="text-xl">🔔</span>
                                    <span className="text-sm font-medium">실시간 예약 접수중</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* 스크롤 인디케이터 */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="flex flex-col items-center text-white/60">
                        <span className="text-xs mb-2 tracking-widest">SCROLL</span>
                        <motion.div
                            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
                        >
                            <motion.div
                                className="w-1.5 h-1.5 bg-white rounded-full"
                                animate={{ y: [0, 16, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </WavyBackground>
        </div>
    );
}
