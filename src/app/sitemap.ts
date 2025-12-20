
import { MetadataRoute } from 'next';
import { jeonbukRegions } from '@/data/regions';
import { createClient } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://xn--2e0bm8utzck3fsyi7rvktd.com';

    // 1. 기본 페이지
    const routes = [
        '',
        '/about',
        '/contact',
        '/services/hasugu',
        '/services/sink',
        '/services/toilet',
        '/services/highpressure',
        '/services/cctv',
        '/services/watertank',
        '/cases',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. 지역별 페이지 (시/군)
    const cityRoutes = jeonbukRegions.map((region) => ({
        url: `${baseUrl}/${region.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 3. 읍/면/동 페이지
    const dongRoutes = jeonbukRegions.flatMap((region) =>
        region.districts.map((district) => ({
            url: `${baseUrl}/${region.id}/${district}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))
    );

    // 4. 동적 시공사례 페이지 (Supabase 데이터)
    let postRoutes: MetadataRoute.Sitemap = [];
    try {
        const supabase = createClient();
        const { data: posts } = await supabase
            .from('posts')
            .select('id, created_at')
            .eq('status', 'published');

        if (posts) {
            postRoutes = posts.map((post) => ({
                url: `${baseUrl}/cases/${post.id}`,
                lastModified: new Date(post.created_at),
                changeFrequency: 'monthly' as const, // 이미 완료된 시공사례는 자주 안 바뀜
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Sitemap post fetch error:', error);
    }

    return [...routes, ...cityRoutes, ...dongRoutes, ...postRoutes];
}
