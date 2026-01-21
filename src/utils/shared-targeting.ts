/**
 * Shared Targeting Logic (SSOT)
 * - Defines target services and rural area restrictions.
 * - Used by post-generator.ts and validate-logic.ts.
 */

// Core Services
export const TARGET_SERVICES = [
    '하수구막힘',
    '변기막힘',
    '싱크대막힘',
    '하수구고압세척',
    '수전교체',
    '배관내시경'
] as const;

// Rural Areas (Low Population) - Restricted Services
export const RURAL_AREAS = [
    '진안', '무주', '장수', '임실', '순창', '고창', '부안',
    '담양', '곡성', '구례', '화순', '함평', '영광', '장성',
    '완도', '진도', '신안'
] as const;

// Helper to determine allowed services for a location
export function getAllowedServices(city: string, dong: string): string[] {
    const isRural =
        RURAL_AREAS.some(c => city.includes(c)) ||
        city.endsWith('군') ||
        dong.endsWith('읍') ||
        dong.endsWith('면');

    if (isRural) {
        // Rural areas only get the primary service
        return ['하수구막힘'];
    }

    // Urban areas get all services
    return [...TARGET_SERVICES];
}

// Helper to normalize District names (e.g. 삼천1동 -> 삼천동)
export function normalizeDistrictName(district: string): string {
    if (district.endsWith('동')) {
        return district.replace(/\d+동$/, '동');
    }
    return district;
}
