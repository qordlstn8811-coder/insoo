import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutElements from "@/components/ClientLayoutElements";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://bananajeonju.netlify.app'),
  title: {
    template: '%s | 전북하수구막힘',
    default: "전주 하수구 뚫음 & 배관 청소 | 24시 긴급출동 전북하수구막힘",
  },
  description: "30분 내 방문! 전주·군산·익산 하수구막힘, 변기막힘, 싱크대막힘 전문. 정찰제 요금표 공개, 1년 A/S 보장. 지금 바로 ☎010-8184-3496",
  keywords: [
    // 핵심 서비스 키워드 (Intent-focused)
    "하수구 뚫음", "하수구 뚫는 비용", "변기 막힘 비용", "싱크대 뚫는 가격",
    "하수구막힘", "하수구뚫는곳", "하수구청소", "하수구고압세척", "트렌치막힘", "횡주관세척", "육가교체", "집수정청소", "정화조뚫음",
    "변기막힘", "변기뚫는곳", "변기수리", "양변기막힘",
    "싱크대막힘", "싱크대뚫는곳", "주방배수구막힘", "싱크대배수구",
    "고압세척", "배관세척", "배관청소", "배관뚫기",
    "배관내시경", "배관카메라", "CCTV배관",
    // 핵심 지역 키워드 (Local SEO)
    "전주 하수구 뚫음", "전주 하수구 업체", "전주 변기 막힘", "전주 싱크대 막힘",
    "완산구 하수구막힘", "덕진구 하수구막힘", "효자동 하수구", "송천동 배관",
    "군산하수구", "군산변기막힘", "군산싱크대막힘",
    "익산하수구", "익산변기막힘", "익산싱크대막힘",
    "완주하수구", "정읍하수구", "남원하수구", "김제하수구",
    "전북하수구", "전라북도하수구", "전북하수구막힘",
    // 긴급/24시
    "24시하수구", "긴급하수구", "야간하수구", "심야하수구출장",
    "24시변기막힘", "긴급배관수리"
  ].join(", "),
  authors: [{ name: "전북하수구막힘" }],
  creator: "전북하수구막힘",
  publisher: "전북하수구막힘",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  formatDetection: {
    telephone: true,
  },
  alternates: {
    canonical: "https://bananajeonju.netlify.app",
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://bananajeonju.netlify.app',
    siteName: '전주하수구막힘', // 사용자가 원하는 사이트 이름
    title: '전주 하수구 뚫음 & 배관 청소 | 24시 긴급출동',
    description: '30분 내 방문! 전주·군산·익산 하수구막힘, 변기막힘, 싱크대막힘 전문. 정찰제 요금표 공개. ☎010-8184-3496',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: '전북하수구막힘 - 하수구 변기 싱크대 막힘 전문',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전북하수구막힘 | 전북 하수구막힘 24시 긴급출동',
    description: '전라북도 전지역 하수구막힘 전문. 010-8184-3496',
    images: ['/images/hero.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 네이버 웹마스터 도구 - 실제 인증 코드로 변경 필요
    // other: {
    //   'naver-site-verification': 'your-naver-code',
    // },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // WebSite 스키마: 사이트 이름 표시용
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '전주하수구막힘',
    alternateName: ['전북하수구막힘', '바나나배관'],
    url: 'https://bananajeonju.netlify.app',
  };

  // LocalBusiness 스키마: 지역 비즈니스 정보용
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'PlumbingService',
    name: '전북하수구막힘', // 비즈니스 등록 명칭
    image: 'https://bananajeonju.netlify.app/images/hero.png',
    '@id': 'https://bananajeonju.netlify.app',
    url: 'https://bananajeonju.netlify.app',
    telephone: '010-8184-3496',
    description: '전주, 군산, 익산 등 전라북도 전지역 하수구막힘, 변기막힘, 싱크대막힘 전문 해결사 전북배관입니다.',
    areaServed: [
      { '@type': 'State', name: 'Jeollabuk-do' },
      { '@type': 'City', name: '전주시' },
      { '@type': 'City', name: '군산시' },
      { '@type': 'City', name: '익산시' },
      { '@type': 'City', name: '김제시' },
      { '@type': 'City', name: '완주군' },
      { '@type': 'City', name: '정읍시' },
      { '@type': 'City', name: '남원시' }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: '전주시',
      addressRegion: '전라북도',
      addressCountry: 'KR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.8242,
      longitude: 127.1480
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'
      ],
      opens: '00:00',
      closes: '23:59'
    },
    priceRange: '₩50,000~'
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="b8a6791951a6258cdf21d6f27ac056f93e1aad99" />
        <meta name="google-site-verification" content="FiHPYcjLehLtiuxnpgBlMONppK_l4AWasa-lryKV_2g" />
        <link rel="canonical" href="https://bananajeonju.netlify.app" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([websiteSchema, localBusinessSchema])
          }}
        />
        {children}
        <ClientLayoutElements />
      </body>
    </html>
  );
}
