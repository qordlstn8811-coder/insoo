
import { jeonbukRegions } from './src/data/regions';

const baseUrl = 'https://xn--2e0bm8utzck3fsyi7rvktd.com';

const urls: string[] = [];

// 1. Add city routes
jeonbukRegions.forEach(region => {
    urls.push(`${baseUrl}/${region.id}`);

    // 2. Add district routes
    region.districts.forEach(district => {
        urls.push(`${baseUrl}/${region.id}/${district}`);
    });
});

console.log(urls.join('\n'));
