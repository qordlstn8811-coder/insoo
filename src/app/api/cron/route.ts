import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Same as in post-generator.ts)
// Client initialization moved inside function
// const supabase = createClient(...)

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Security Check
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Calculate KST Time
        const now = new Date();
        const kstOffset = 9 * 60; // KST is UTC+9
        const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);
        const kstDateString = kstTime.toISOString().split('T')[0]; // YYYY-MM-DD

        // Start of Day in KST (which is previous day's 15:00 UTC)
        // We use ISOSString comparison for DB query
        const startOfKstDay = new Date(`${kstDateString}T00:00:00+09:00`);
        const startOfKstDayIso = startOfKstDay.toISOString();

        // 2. Check Daily Count
        const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfKstDayIso);

        if (error) {
            console.error('[Cron] DB Error:', error);
            // If DB check fails, try to generate at least one safely
            throw error;
        }

        const currentCount = count || 0;
        const TARGET_DAILY = 100;
        const currentKstHour = kstTime.getUTCHours();
        const remainingHours = 24 - currentKstHour;

        console.log(`[Cron] Time(KST): ${kstTime.toISOString()}, Count: ${currentCount}, Target: ${TARGET_DAILY}, RemainingHours: ${remainingHours}`);

        if (currentCount >= TARGET_DAILY) {
            return NextResponse.json({ message: 'Daily target reached', count: currentCount });
        }

        // 3. Calculate Batch Size
        // If remaining hours is 0 (23:00-24:00), treat as 1 hour left
        const safeRemainingHours = remainingHours <= 0 ? 1 : remainingHours;
        const remainingPosts = TARGET_DAILY - currentCount;

        // Simple distribution: evenly spread remaining work
        let batchSize = Math.ceil(remainingPosts / safeRemainingHours);

        // Safety Caps
        // Max 5 concurrent generations to prevent timeout (Vercel has 10s-60s limits)
        // If we fall behind, we max out at 5/hour, which is 120/day capacity, sufficient for 100.
        const MAX_BATCH_SIZE = 5;
        const executionCount = Math.min(batchSize, MAX_BATCH_SIZE);

        // Ensure at least 1 if we are behind (and not met target)
        const finalBatchSize = Math.max(1, executionCount);

        console.log(`[Cron] Executing Batch Size: ${finalBatchSize} (Calculated: ${batchSize})`);

        // 4. Execute Batch in Parallel
        // We use Promise.all to run them concurrently for speed
        const promises = Array.from({ length: finalBatchSize }).map(async (_, index) => {
            // Add slight stagger to avoid exact millisecond collision if needed (optional)
            // But API race conditions are usually handled by DB
            try {
                const res = await generatePostAction();
                return res;
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        });

        const results = await Promise.all(promises);

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        return NextResponse.json({
            success: true,
            message: `Batch execution complete`,
            stats: {
                previousCount: currentCount,
                attempted: finalBatchSize,
                succeeded: successCount,
                failed: failCount,
                newTotalEstimate: currentCount + successCount
            },
            results
        });

    } catch (error: any) {
        console.error('[Cron] Critical Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
