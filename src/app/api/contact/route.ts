
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// 텔레그램 봇 설정
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 전화번호 유효성 검사 정규식
const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

// 텔레그램으로 알림 보내기
async function sendTelegramNotification(name: string, phone: string, region: string, message?: string) {
    try {
        const text = `🔔 새로운 문의가 접수되었습니다!

👤 이름: ${name}
📞 전화번호: ${phone}
📍 지역: ${region}
💬 문의내용: ${message || '(내용 없음)'}

⏰ 접수시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`;

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            console.error('Telegram notification failed:', await response.text());
        }
    } catch (error) {
        console.error('Telegram notification error:', error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, region, message } = body;

        // 유효성 검사
        if (!name || !phone || !region) {
            return NextResponse.json(
                { error: '필수 항목이 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 전화번호 형식 검사
        if (!PHONE_REGEX.test(phone.replace(/-/g, '').replace(/\s/g, ''))) {
            return NextResponse.json(
                { error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' },
                { status: 400 }
            );
        }

        // Supabase에 데이터 저장
        const { data, error } = await supabase
            .from('inquiries')
            .insert([
                { name, phone, region, message, created_at: new Date().toISOString() },
            ])
            .select();

        if (error) {
            console.error('Supabase Error:', error);
            return NextResponse.json(
                { error: '데이터 저장 중 오류가 발생했습니다.' },
                { status: 500 }
            );
        }

        // 텔레그램 알림 보내기
        await sendTelegramNotification(name, phone, region, message);

        return NextResponse.json(
            { message: '문의가 성공적으로 접수되었습니다.', data },
            { status: 200 }
        );
    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { error: '서버 내부 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
