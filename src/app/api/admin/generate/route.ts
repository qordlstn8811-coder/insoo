import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';

export const maxDuration = 60; // 60 seconds (Vercel Hobby plan limit for serverless)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        // Simple security check
        if (password !== '1234') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await generatePostAction('manual');

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Manual generation failed:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ready', message: 'Manual generation API is ready. Use POST to trigger.' });
}
