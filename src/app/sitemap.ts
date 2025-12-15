
import { MetadataRoute } from 'next';
import { jeonbukRegions } from '@/data/regions';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://전북하수구막힘.com'; // 도메인 설정 완료

    // 기본 페이지
    const routes = [
        '',
        '/about',
        '/contact',
        '/services/hasugu',
        '/services/sink',
        '/services/toilet',
        '/services/highpressure',
        '/services/cctv',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 지역별 페이지 (시/군)
    const cityRoutes = jeonbukRegions.map((region) => ({
        url: `${baseUrl}/${region.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 읍/면/동 페이지
    const dongRoutes = jeonbukRegions.flatMap((region) =>
        region.districts.map((district) => ({
            url: `${baseUrl}/${region.id}/${district}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    );

    return [...routes, ...cityRoutes, ...dongRoutes];
}
