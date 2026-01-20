import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 55;

const MAX_POSTS_PER_REQUEST = 5;
const MAX_RETRIES = 7;
const STAGGER_DELAY_MS = 2000;
const RETRY_BACKOFF_MS = 3000;

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('key');

        if (!process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Server Configuration Error: CRON_SECRET missing' }, { status: 500 });
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
        }

        const cleanHeader = authHeader?.trim();
        const cleanKey = apiKey?.trim();
        const serverSecret = process.env.CRON_SECRET?.trim();

        const isValid = (cleanHeader === `Bearer ${serverSecret}`) || (cleanKey === serverSecret);

        if (!isValid) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limitStr = searchParams.get('limit');
        const limit = Math.min(parseInt(limitStr || '1', 10), MAX_POSTS_PER_REQUEST);

        const promises = Array.from({ length: limit }).map(async (_, idx) => {
            await new Promise(resolve => setTimeout(resolve, idx * STAGGER_DELAY_MS));

            let result;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    result = await generatePostAction('auto');

                    if (result.success) {
                        return result;
                    }

                    if (attempt < MAX_RETRIES) {
                        const backoff = attempt * RETRY_BACKOFF_MS;
                        await new Promise(resolve => setTimeout(resolve, backoff));
                    }
                } catch {
                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, attempt * RETRY_BACKOFF_MS));
                    }
                }
            }
            return result || { success: false, error: 'Max retries exceeded' };
        });

        const results = await Promise.all(promises);

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;

        return NextResponse.json({
            success: true,
            generated: successCount,
            failed: failedCount,
            details: results,
            version: "v4-abstract-fix-confirmed"
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
