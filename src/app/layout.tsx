import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutElements from "@/components/ClientLayoutElements";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.xn--2e0bm8utzck3fsyi7rvktd.com'),
  title: "전북배관 | 전주 하수구막힘 변기막힘 싱크대막힘 24시 긴급출동",
  description: "전주, 군산, 익산, 완주, 정읍, 남원, 김제 전라북도 전지역 하수구막힘, 변기막힘, 싱크대막힘, 고압세척, 배관내시경 전문. 30분 내 긴급출동! 합리적인 정찰제 가격. 010-8184-3496",
  keywords: [
    // 서비스 키워드
    "하수구막힘", "하수구뚫는곳", "하수구청소", "하수구고압세척",
    "변기막힘", "변기뚫는곳", "변기수리", "양변기막힘",
    "싱크대막힘", "싱크대뚫는곳", "주방배수구막힘", "싱크대배수구",
    "고압세척", "배관세척", "배관청소", "배관뚫기",
    "배관내시경", "배관카메라", "CCTV배관",
    // 지역 키워드
    "전주하수구", "전주변기막힘", "전주싱크대막힘", "전주배관",
    "군산하수구", "군산변기막힘", "군산싱크대막힘",
    "익산하수구", "익산변기막힘", "익산싱크대막힘",
    "완주하수구", "정읍하수구", "남원하수구", "김제하수구",
    "전북하수구", "전라북도하수구", "전북배관",
    // 긴급/24시
    "24시하수구", "긴급하수구", "야간하수구", "심야하수구출장",
    "24시변기막힘", "긴급배관수리"
  ].join(", "),
  authors: [{ name: "전북배관" }],
  creator: "전북배관",
  publisher: "전북배관",
  formatDetection: {
    telephone: true,
  },
  alternates: {
    canonical: "https://www.xn--2e0bm8utzck3fsyi7rvktd.com",
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.xn--2e0bm8utzck3fsyi7rvktd.com',
    siteName: '전북배관',
    title: '전북배관 | 전주 하수구막힘 변기막힘 24시 긴급출동',
    description: '전주, 군산, 익산 전라북도 전지역 하수구막힘, 변기막힘, 싱크대막힘 전문. 30분 내 긴급출동! 010-8184-3496',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: '전북배관 - 하수구 변기 싱크대 막힘 전문',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전북배관 | 전주 하수구막힘 24시 긴급출동',
    description: '전주, 군산, 익산 전라북도 전지역 하수구막힘 전문. 010-8184-3496',
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
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="b8a6791951a6258cdf21d6f27ac056f93e1aad99" />
        <meta name="google-site-verification" content="FiHPYcjLehLtiuxnpgBlMONppK_l4AWasa-lryKV_2g" />
        <link rel="canonical" href="https://www.xn--2e0bm8utzck3fsyi7rvktd.com" />
      </head>
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PlumbingService',
              name: '전북배관',
              image: 'https://www.xn--2e0bm8utzck3fsyi7rvktd.com/images/logo.png',
              '@id': 'https://www.xn--2e0bm8utzck3fsyi7rvktd.com',
              url: 'https://www.xn--2e0bm8utzck3fsyi7rvktd.com',
              telephone: '010-8184-3496',
              description: '전주, 군산, 익산 전라북도 전지역 하수구막힘, 변기막힘, 싱크대막힘 24시 긴급출동',
              areaServed: {
                '@type': 'State',
                name: 'Jeollabuk-do',
                containsPlace: [
                  { '@type': 'City', name: '전주시' },
                  { '@type': 'City', name: '군산시' },
                  { '@type': 'City', name: '익산시' },
                  { '@type': 'City', name: '정읍시' },
                  { '@type': 'City', name: '남원시' },
                  { '@type': 'City', name: '김제시' },
                  { '@type': 'City', name: '완주군' }
                ]
              },
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
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: '배관 서비스',
                itemListElement: [
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '하수구 막힘' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '변기 막힘' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '싱크대 막힘' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '고압 세척' } },
                  { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '배관 내시경' } }
                ]
              },
              priceRange: '₩50,000~'
            })
          }}
        />
        {children}
        <ClientLayoutElements />
      </body>
    </html>
  );
}

