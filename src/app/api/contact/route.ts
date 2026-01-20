import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseKey = serviceRoleKey || anonKey;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

async function sendTelegramNotification(name: string, phone: string, region: string, message?: string) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        return;
    }

    try {
        const text = `새로운 문의가 접수되었습니다!

이름: ${name}
전화번호: ${phone}
지역: ${region}
문의내용: ${message || '(내용 없음)'}

접수시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML',
            }),
        });
    } catch {
        // Silent fail for notification
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, region, message } = body;

        if (!name || !phone || !region) {
            return NextResponse.json(
                { error: '필수 항목이 누락되었습니다.' },
                { status: 400 }
            );
        }

        if (!PHONE_REGEX.test(phone.replace(/-/g, '').replace(/\s/g, ''))) {
            return NextResponse.json(
                { error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { error: '서버 설정 오류입니다.' },
                { status: 500 }
            );
        }

        const { data, error } = await supabase
            .from('inquiries')
            .insert([{ name, phone, region, message }]);

        if (error) {
            return NextResponse.json(
                { error: '데이터 저장 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        await sendTelegramNotification(name, phone, region, message);

        return NextResponse.json(
            { message: '문의가 성공적으로 접수되었습니다.', data },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { error: '서버 내부 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
