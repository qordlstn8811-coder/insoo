'use client';

import { useState, useEffect } from 'react';

export default function CallPopup() {
    const [isVisible, setIsVisible] = useState(false);
    // Start as TRUE (hidden) to avoid flash. Only set to false if we confirm it's NOT closed.
    const [hasBeenClosed, setHasBeenClosed] = useState(true);

    useEffect(() => {
        // 이미 닫은 적이 있는지 확인
        const closed = sessionStorage.getItem('callPopupClosed');

        // 닫은 적이 없다면 (closed is null) -> 보여줄 준비
        if (!closed) {
            setHasBeenClosed(false);

            // 5초 후에 팝업 표시
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setHasBeenClosed(true);
        sessionStorage.setItem('callPopupClosed', 'true');
    };

    if (!isVisible || hasBeenClosed) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                {/* 닫기 버튼 */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 헤더 */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        🚨 배관 문제로 급하신가요?
                    </h2>
                    <p className="text-blue-100 text-sm">
                        지금 바로 전화주시면 30분 안에 도착합니다!
                    </p>
                </div>

                {/* 본문 */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-3xl font-extrabold text-blue-600 mb-2">
                            010-8184-3496
                        </div>
                        <p className="text-gray-500 text-sm">
                            24시간 연중무휴 · 전북 전지역 출장
                        </p>
                    </div>

                    {/* 혜택 */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">출장비 무료 · 상담비 무료</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">최신 고압세척 장비 보유</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-gray-700">작업 후 1년 A/S 보장</span>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="space-y-3">
                        <a
                            href="tel:010-8184-3496"
                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                            📞 지금 바로 전화하기
                        </a>
                        <button
                            onClick={handleClose}
                            className="block w-full text-gray-400 text-center py-2 text-sm hover:text-gray-600 transition-colors"
                        >
                            나중에 연락할게요
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.9); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
