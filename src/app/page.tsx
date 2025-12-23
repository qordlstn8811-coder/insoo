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
  title: '전북하수구막힘 | 하수구·변기·싱크대 막힘 24시간 긴급출동',
  description: '전주, 군산, 익산 전 서비스 지역 30분 방문. 최신 내시경 장비 보유, 1년 A/S 보장. 막힌 곳 확실하게 뚫어드립니다.',
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
