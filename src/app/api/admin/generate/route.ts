import { NextResponse } from 'next/server';
import { generatePostAction } from '@/lib/post-generator';

export const maxDuration = 60; // 60 seconds (Vercel Hobby plan limit for serverless)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (password !== adminPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await generatePostAction('manual');

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: 'ready', message: 'Manual generation API is ready. Use POST to trigger.' });
}
