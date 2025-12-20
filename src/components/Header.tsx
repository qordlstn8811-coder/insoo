'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { jeonbukRegions } from '@/data/regions';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

    return (
        <header className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-20">
                    {/* 로고 */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/logo.png" alt="전북하수구막힘 로고" width={40} height={40} className="w-10 h-10" />
                        <span className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight">전북<span className="text-blue-600">하수구막힘</span></span>
                    </Link>

                    {/* 데스크톱 네비게이션 */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        <div className="relative group">
                            <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                                서비스
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 w-48 border">
                                <Link href="/services/hasugu" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">하수구 막힘</Link>
                                <Link href="/services/sink" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">싱크대 막힘</Link>
                                <Link href="/services/toilet" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">변기 막힘</Link>
                                <Link href="/services/highpressure" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">고압세척</Link>
                                <Link href="/services/cctv" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">배관 내시경</Link>
                            </div>
                        </div>

                        <div className="relative group">
                            <button className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-1">
                                지역별 안내
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-xl rounded-lg py-2 w-56 border max-h-80 overflow-y-auto">
                                {jeonbukRegions.map((region) => (
                                    <Link
                                        key={region.id}
                                        href={`/${region.id}`}
                                        className="block px-4 py-2 hover:bg-blue-50 text-gray-700"
                                    >
                                        {region.name} 하수구
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                            업체소개
                        </Link>
                        <Link href="/cases" className="text-gray-700 hover:text-blue-600 font-medium">
                            시공사례
                        </Link>
                        <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
                            상담문의
                        </Link>
                    </nav>

                    {/* 모바일 햄버거 버튼 + 전화 버튼 */}
                    <div className="flex items-center gap-3">
                        {/* 전화번호 버튼 */}
                        <a
                            href="tel:010-8184-3496"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 flex items-center gap-2 text-sm md:text-base"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="hidden sm:inline">010-8184-3496</span>
                            <span className="sm:hidden">전화</span>
                        </a>

                        {/* 햄버거 버튼 (모바일) */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="메뉴 열기"
                        >
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 모바일 메뉴 패널 */}
            <div
                className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[80vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                <nav className="px-4 py-4 space-y-2">
                    {/* 서비스 드롭다운 */}
                    <div>
                        <button
                            onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                            className="w-full flex justify-between items-center py-3 px-4 text-gray-700 font-medium hover:bg-blue-50 rounded-lg"
                        >
                            서비스
                            <svg className={`w-5 h-5 transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`pl-4 space-y-1 transition-all duration-200 ${serviceDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <Link href="/services/hasugu" className="block py-2 px-4 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>하수구 막힘</Link>
                            <Link href="/services/sink" className="block py-2 px-4 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>싱크대 막힘</Link>
                            <Link href="/services/toilet" className="block py-2 px-4 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>변기 막힘</Link>
                            <Link href="/services/highpressure" className="block py-2 px-4 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>고압세척</Link>
                            <Link href="/services/cctv" className="block py-2 px-4 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>배관 내시경</Link>
                        </div>
                    </div>

                    {/* 지역별 안내 드롭다운 */}
                    <div>
                        <button
                            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                            className="w-full flex justify-between items-center py-3 px-4 text-gray-700 font-medium hover:bg-blue-50 rounded-lg"
                        >
                            지역별 안내
                            <svg className={`w-5 h-5 transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className={`pl-4 space-y-1 transition-all duration-200 ${regionDropdownOpen ? 'max-h-96 opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            {jeonbukRegions.slice(0, 8).map((region) => (
                                <Link
                                    key={region.id}
                                    href={`/${region.id}`}
                                    className="block py-2 px-4 text-gray-600 hover:text-blue-600"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {region.name} 하수구
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 일반 링크 */}
                    <Link
                        href="/about"
                        className="block py-3 px-4 text-gray-700 font-medium hover:bg-blue-50 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        업체소개
                    </Link>
                    <Link
                        href="/cases"
                        className="block py-3 px-4 text-gray-700 font-medium hover:bg-blue-50 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        시공사례
                    </Link>
                    <Link
                        href="/contact"
                        className="block py-3 px-4 text-gray-700 font-medium hover:bg-blue-50 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        상담문의
                    </Link>

                    {/* 모바일 전화 CTA */}
                    <a
                        href="tel:010-8184-3496"
                        className="block mt-4 bg-blue-600 text-white text-center py-4 rounded-xl font-bold shadow-lg"
                    >
                        📞 지금 전화하기: 010-8184-3496
                    </a>
                </nav>
            </div>
        </header>
    );
}
