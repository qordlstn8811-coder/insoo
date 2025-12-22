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
            // 초기 지연 (API 몰림 방지)
            await new Promise(resolve => setTimeout(resolve, idx * 2000));

            // [Retry Logic] 최대 3번 재시도
            let result;
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    result = await generatePostAction('auto');

                    if (result.success) {
                        if (attempt > 1) {
                            console.log(`[Cron] Succeeded on attempt ${attempt}`);
                        }
                        return result;
                    }

                    console.warn(`[Cron] Attempt ${attempt}/${maxRetries} failed: ${result.error}`);

                    if (attempt < maxRetries) {
                        const backoff = attempt * 3000; // 3s, 6s...
                        await new Promise(resolve => setTimeout(resolve, backoff));
                    }
                } catch (e: any) {
                    console.error(`[Cron] Critical error on attempt ${attempt}:`, e);
                    if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, attempt * 3000));
                }
            }
            return result || { success: false, error: 'Max retries exceeded' };
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
