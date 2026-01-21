import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveReviewFeed from '@/components/LiveReviewFeed';
import RecentCases from '@/components/RecentCases';
import AnimatedMainContent from '@/components/AnimatedMainContent';
import { serviceDetails } from '@/data/services';
import { jeonbukRegions } from '@/data/regions';
import { faqContent, companyInfo } from '@/data/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '전주 하수구 뚫음 비용 & 배관 청소 견적 | 전북하수구막힘',
  description: '전주·군산·익산 하수구 뚫는 비용 궁금하세요? 정찰제로 투명하게 공개합니다. 최신 내시경 장비로 정확한 진단, 30분 내 방문. ☎010-8184-3496',
};

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-slate-50 via-sky-50 to-pink-50">
      <Header />
      <Hero />
      <LiveReviewFeed />
      <RecentCases />
      <AnimatedMainContent
        serviceDetails={serviceDetails}
        jeonbukRegions={jeonbukRegions}
        faqContent={faqContent}
        companyInfo={companyInfo}
      />
    </main>
  );
}
