import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveReviewFeed from '@/components/LiveReviewFeed';
import RecentCases from '@/components/RecentCases';
import AnimatedMainContent from '@/components/AnimatedMainContent';
import { serviceDetails } from '@/data/services';
import { jeonbukRegions } from '@/data/regions';
import { faqContent, companyInfo } from '@/data/content';
import { Metadata } from 'next';
import * as motion from 'motion/react-client';

export const metadata: Metadata = {
  title: '전주 하수구 뚫음 비용 & 배관 청소 견적 | 전북하수구막힘',
  description: '전주·군산·익산 하수구 뚫는 비용 궁금하세요? 정찰제로 투명하게 공개합니다. 최신 내시경 장비로 정확한 진단, 30분 내 방문. ☎010-8184-3496',
};

export default function Home() {
  return (
    <motion.main
      animate={{
        backgroundColor: [
          '#f8fafc', // slate-50
          '#f0f9ff', // sky-50
          '#f5f3ff', // violet-50
          '#fdf2f8', // pink-50
          '#f8fafc',
        ],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    >
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
    </motion.main>
  );
}
