import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';
import { createClient } from '@supabase/supabase-js';
import { SettingsService } from '@/lib/settings';

// Vercel Cron은 기본적으로 타임아웃이 10초이므로, 긴 작업을 위해 런타임을 설정할 수 있음
export const maxDuration = 60; // 60초
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        // 1. 설정 로드
        const settings = await SettingsService.getSettings();

        // 2. 자동화 ON/OFF 체크
        if (!settings.isActive) {
            return NextResponse.json({
                message: '자동화가 비활성화 상태입니다.',
                executed: false,
                settings
            });
        }

        // 3. 시간대 체크
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(settings.startTime.split(':')[0]);
        const endHour = parseInt(settings.endTime.split(':')[0]);

        // 시간이 범위 밖이면 스킵 (단, 자정 넘어가는 경우는 별도 처리 필요하지만 일단 단순 범위로)
        if (currentHour < startHour || currentHour >= endHour) {
            return NextResponse.json({
                message: `운영 시간이 아닙니다. (${settings.startTime}~${settings.endTime})`,
                executed: false,
                currentHour
            });
        }

        // 4. 오늘 발행된 글 개수 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString())
            .neq('status', 'system'); // 시스템 설정 글 제외

        if (error) throw error;

        const currentCount = count || 0;
        const dailyTarget = settings.dailyTarget;

        // 5. 목표 달성 여부 체크
        if (currentCount >= dailyTarget) {
            return NextResponse.json({
                message: `오늘 목표 달성 완료(${currentCount} / ${dailyTarget})`,
                executed: false
            });
        }

        // 6. 글 생성 실행
        console.log(`[CRON] 글 생성 시작 via CronJob(현재: ${currentCount} / ${dailyTarget})`);
        const result = await generatePostAction();

        return NextResponse.json({
            message: '글 생성 성공',
            executed: true,
            data: result,
            daily_status: `${currentCount + 1}/${dailyTarget}`
        });

    } catch (error: any) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
