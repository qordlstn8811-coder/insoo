'use client';

import { useState, useEffect } from 'react';
import { reviews, Review } from '@/data/reviews';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LiveReviewFeed() {
    const [visibleReviews, setVisibleReviews] = useState<Review[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // 초기 리뷰 3개 표시
        setVisibleReviews(reviews.slice(0, 3));

        // 3초마다 새 리뷰 추가 (실시간 느낌)
        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = (prev + 1) % reviews.length;
                const newReview = reviews[next];

                setVisibleReviews((current) => {
                    // 새 리뷰를 맨 위에 추가하고, 4개 이상이면 마지막 것 제거
                    const updated = [newReview, ...current.filter(r => r.id !== newReview.id)];
                    return updated.slice(0, 4);
                });

                return next;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 mb-4">
                        <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-700 text-sm font-medium">실시간 고객 후기</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        고객님들의 생생한 후기
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        전북배관을 이용해주신 고객님들의 실제 후기입니다.
                    </p>
                </div>

                <div className="relative">
                    {/* 실시간 알림 효과 */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full animate-bounce shadow-lg">
                            🔔 새로운 후기가 도착했습니다!
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {visibleReviews.map((review, index) => (
                            <Card
                                key={`${review.id}-${index}`}
                                className={`transition-all duration-500 hover:shadow-lg hover:scale-[1.02] ${index === 0 ? 'animate-slideIn ring-2 ring-blue-100' : ''}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                                                    {review.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-900 flex items-center gap-2">
                                                    {review.name}
                                                    {review.verified && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                                            ✓ 인증됨
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {review.region} {review.dong}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{review.date}</div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                            {review.service}
                                        </Badge>
                                    </div>

                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        "{review.content}"
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* 더보기 버튼 */}
                    <div className="text-center mt-8">
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-medium">
                            전체 후기 보기
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
        </section>
    );
}
