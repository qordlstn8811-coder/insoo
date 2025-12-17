import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';
import { createClient } from '@supabase/supabase-js';

// Vercel Cron은 기본적으로 타임아웃이 10초이므로, 긴 작업을 위해 런타임을 설정할 수 있음
export const maxDuration = 60; // 60초 (Pro Plan 권장, Hobby는 10초 제한일 수 있음. 가볍게 유지)
export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 사용자 설정 (나중에 DB화 가능)
const DAILY_TARGET = 20; // 하루 목표 발행량

export async function GET(request: Request) {
    try {
        // 1. 보안 체크 (Vercel Cron 헤더 확인)
        const authHeader = request.headers.get('authorization');
        // 로컬 테스트를 위해 'Bearer test-secret' 허용하거나, 배포 시엔 CRON_SECRET 환경변수 확인 필요
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        // 2. 오늘 발행된 글 개수 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        if (error) throw error;

        const currentCount = count || 0;

        // 3. 목표 달성 여부 체크
        if (currentCount >= DAILY_TARGET) {
            return NextResponse.json({
                message: `오늘 목표 달성 완료 (${currentCount}/${DAILY_TARGET})`,
                executed: false
            });
        }

        // 4. 실행 확률 로직 (랜덤성을 위해)
        // 예를 들어 30분마다 크론이 돈다고 가정 (하루 48회)
        // 남은 횟수 / 남은 시간 비율로 확률 계산 등 복잡한 로직보다는
        // 단순하게 "목표 미달이면 무조건 실행" 하되, 크론 스케줄 간격을 조절하는 게 더 확실함.
        // 여기서는 "목표 미달이면 실행"으로 단순화. 
        // (사용자가 간격을 랜덤하게 해달라고 했으므로, 여기서 sleep을 주거나 확률로 skip할 수 있음)

        // 랜덤 Skip 기능 (50% 확률로 실행) -> 하루 48번 찔러도 24번만 실행됨 (얼추 20개 맞춤)
        // 만약 너무 적게 발행되면 안 되니까, 저녁 시간대에는 확률을 높이는 로직도 가능하지만 일단 단순하게.

        const shouldRun = Math.random() > 0.3; // 70% 확률로 실행 (조금 더 적극적으로 발행)

        if (!shouldRun && currentCount < DAILY_TARGET) {
            return NextResponse.json({
                message: `랜덤 스킵 당첨 (발행 안 함) - 현재: ${currentCount}개`,
                executed: false
            });
        }

        // 5. 글 생성 실행
        console.log(`[CRON] 글 생성 시작 via CronJob (현재: ${currentCount}개)`);
        const result = await generatePostAction();

        return NextResponse.json({
            message: '글 생성 성공',
            executed: true,
            data: result,
            daily_status: `${currentCount + 1}/${DAILY_TARGET}`
        });

    } catch (error: any) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
