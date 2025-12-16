
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: 'https://www.xn--2e0bm8utzck3fsyi7rvktd.com/sitemap.xml', // 도메인 설정 완료
    };
}
