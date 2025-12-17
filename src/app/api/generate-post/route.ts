import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';

export async function POST(request: Request) {
    try {
        const result = await generatePostAction();

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || '서버 오류 발생' }, { status: 500 });
    }
}
