import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 봇 User-Agent 패턴
const BOT_PATTERNS = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /java(?!script)/i,
    /phantom/i, /headless/i, /selenium/i, /puppeteer/i
];

// 소스 판별
function detectSource(referer: string | null): string {
    if (!referer) return 'direct';
    if (referer.includes('search.naver.com') || referer.includes('naver.com')) return 'naver';
    if (referer.includes('google.com') || referer.includes('google.co.kr')) return 'google';
    if (referer.includes('daum.net') || referer.includes('search.daum.net')) return 'daum';
    return 'other';
}

// 봇 감지
function isBot(userAgent: string | null): boolean {
    if (!userAgent) return true;
    return BOT_PATTERNS.some(pattern => pattern.test(userAgent));
}

export async function POST(request: NextRequest) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { sessionId, fingerprint, pageUrl } = body;

        // IP 추출 (Vercel/Netlify 환경)
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

        const userAgent = request.headers.get('user-agent') || '';
        const referer = request.headers.get('referer') || body.referer || '';
        const source = detectSource(referer);

        // 봇 감지
        if (isBot(userAgent)) {
            return NextResponse.json({ success: true, tracked: false, reason: 'bot' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false }
        });

        // 동일 IP에서 최근 1시간 내 클릭 횟수 조회
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: recentClicks } = await supabase
            .from('click_logs')
            .select('*', { count: 'exact', head: true })
            .eq('ip_address', ipAddress)
            .gte('created_at', oneHourAgo);

        // 1시간 내 5회 이상이면 의심
        const isSuspicious = (recentClicks || 0) >= 5;

        // 클릭 로그 저장
        const { error } = await supabase.from('click_logs').insert([{
            ip_address: ipAddress,
            user_agent: userAgent.substring(0, 500), // 길이 제한
            referer: referer.substring(0, 500),
            session_id: sessionId || null,
            fingerprint: fingerprint || null,
            page_url: pageUrl || null,
            source,
            is_suspicious: isSuspicious,
        }]);

        if (error) {
            console.error('[Click Tracking] Insert error:', error);
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            tracked: true,
            source,
            suspicious: isSuspicious
        });

    } catch (error) {
        console.error('[Click Tracking] Error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

// GET 요청도 허용 (이미지 픽셀 방식 지원)
export async function GET(request: NextRequest) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        // 1x1 투명 픽셀 반환
        return new NextResponse(
            Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
            { headers: { 'Content-Type': 'image/gif' } }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sid');
        const pageUrl = searchParams.get('url');

        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

        const userAgent = request.headers.get('user-agent') || '';
        const referer = request.headers.get('referer') || '';
        const source = detectSource(referer);

        if (!isBot(userAgent)) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: { persistSession: false }
            });

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { count: recentClicks } = await supabase
                .from('click_logs')
                .select('*', { count: 'exact', head: true })
                .eq('ip_address', ipAddress)
                .gte('created_at', oneHourAgo);

            const isSuspicious = (recentClicks || 0) >= 5;

            await supabase.from('click_logs').insert([{
                ip_address: ipAddress,
                user_agent: userAgent.substring(0, 500),
                referer: referer.substring(0, 500),
                session_id: sessionId,
                fingerprint: null,
                page_url: pageUrl,
                source,
                is_suspicious: isSuspicious,
            }]);
        }

        // 1x1 투명 픽셀 반환
        return new NextResponse(
            Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
            {
                headers: {
                    'Content-Type': 'image/gif',
                    'Cache-Control': 'no-store, no-cache, must-revalidate'
                }
            }
        );
    } catch (error) {
        console.error('[Click Tracking GET] Error:', error);
        return new NextResponse(
            Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
            { headers: { 'Content-Type': 'image/gif' } }
        );
    }
}
