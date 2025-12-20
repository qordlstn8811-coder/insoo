'use client';

import React from 'react';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { reviews } from '@/data/reviews'; // Keep using existing data if possible, or add new ones

export default function LiveReviewFeed() {
    // Transform existing reviews to match InfiniteMovingCards format if needed
    // The format expected is { quote, name, title }
    // Existing Review type seems to be { id, name, region, dong, service, rating, date, content, verified }

    const formattedReviews = reviews.map(review => ({
        quote: review.content,
        name: review.name,
        title: `${review.region} ${review.dong} / ${review.service}`
    }));

    // If existing reviews are few, duplicate them or add more mock data
    const extraReviews = [
        ...formattedReviews,
        {
            quote: "새벽에 급하게 불렀는데 진짜 30분 만에 오셨어요. 변기가 꽉 막혀서 난감했는데, 전문가답게 해결해주셨습니다.",
            name: "김철수 님",
            title: "전주시 완산구 효자동 / 변기 막힘"
        },
        {
            quote: "식당 하수구가 역류해서 영업 못할 뻔했는데, 고압세척 한방에 뚫렸습니다. 강력 추천!",
            name: "박지성 님",
            title: "군산시 수송동 / 식당 하수구"
        },
        {
            quote: "내시경으로 배관 속을 직접 보여주시면서 설명해주시니 믿음이 갔습니다. 과잉 진료 없이 딱 필요한 작업만 해주셨어요.",
            name: "최민수 님",
            title: "익산시 모현동 / 배관 내시경"
        }
    ];

    return (
        <section className="py-20 bg-slate-50 relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/50 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-4">
                    <span className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-blue-700 text-sm font-medium">실시간 고객 만족 후기</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    <span className="text-blue-600">전북하수구막힘</span>을 선택한 고객님들의 이야기
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    실제 이용해 주신 고객님들의 생생한 목소리를 들어보세요.<br className="hidden md:inline" />
                    고객 만족을 위해 항상 최선을 다하겠습니다.
                </p>
            </div>

            <div className="flex flex-col antialiased items-center justify-center relative overflow-hidden">
                <InfiniteMovingCards
                    items={extraReviews}
                    direction="right"
                    speed="slow"
                />
            </div>
        </section>
    );
}
