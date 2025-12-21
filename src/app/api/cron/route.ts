import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';

export const dynamic = 'force-dynamic'; // 캐시 방지
export const maxDuration = 55; // Vercel Hobby Timeout (10~60s) 안전마진

export async function GET(request: Request) {
    try {
        // 1. 보안 체크 (CRON_SECRET)
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('key');

        // Check for essential environment variables
        if (!process.env.CRON_SECRET) {
            console.error('[Cron] CRON_SECRET is missing in environment variables.');
            return NextResponse.json({ error: 'Server Configuration Error: CRON_SECRET missing' }, { status: 500 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Cron] SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.');
            return NextResponse.json({ error: 'Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
        }

        // 헤더 또는 쿼리 파라미터로 인증 허용 (GitHub Actions/Vercel Cron 호환)
        const isValid = (authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
            (apiKey === process.env.CRON_SECRET);

        if (!isValid) {
            console.warn('[Cron] Unauthorized access attempt.', {
                hasAuthHeader: !!authHeader,
                hasApiKey: !!apiKey,
                // Do not log actual values for security
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. 한 번에 생성할 개수 (기본 1개, 최대 5개)
        // Gemini Limit(15 RPM) 및 Vercel Timeout(60s) 고려하여 1로 제한
        const limitStr = searchParams.get('limit');
        const limit = Math.min(parseInt(limitStr || '1', 10), 5); // Max 5

        console.log(`[Cron] Starting generation of ${limit} posts...`);

        // 3. 병렬 실행 (Promise.all)
        const promises = Array.from({ length: limit }).map(async (_, idx) => {
            // 약간의 지연을 주어 API 몰림 방지 (0s, 2s, 4s...)
            await new Promise(resolve => setTimeout(resolve, idx * 2000));
            return generatePostAction('auto');
        });

        const results = await Promise.all(promises);

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;

        console.log(`[Cron] Finished. Success: ${successCount}, Failed: ${failedCount}`);

        return NextResponse.json({
            success: true,
            generated: successCount,
            failed: failedCount,
            details: results
        });

    } catch (error: any) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
