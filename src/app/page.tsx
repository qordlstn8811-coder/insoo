
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveReviewFeed from '@/components/LiveReviewFeed';
import AnimatedMainContent from '@/components/AnimatedMainContent';
import { serviceDetails } from '@/data/services';
import { jeonbukRegions } from '@/data/regions';
import { faqContent, companyInfo } from '@/data/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '전북하수구막힘 | 하수구·변기·싱크대 막힘 24시간 긴급출동',
  description: '전주, 군산, 익산 전 서비스 지역 30분 방문. 최신 내시경 장비 보유, 1년 A/S 보장. 막힌 곳 확실하게 뚫어드립니다.',
};

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <LiveReviewFeed />
      <AnimatedMainContent
        serviceDetails={serviceDetails}
        jeonbukRegions={jeonbukRegions}
        faqContent={faqContent}
        companyInfo={companyInfo}
      />
    </>
  );
}
