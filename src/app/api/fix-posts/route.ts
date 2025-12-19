import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // 모든 posts 가져오기
        const { data: posts, error: fetchError } = await supabase
            .from('posts')
            .select('*');

        if (fetchError) throw fetchError;

        let fixed = 0;
        let failed = 0;

        for (const post of posts || []) {
            if (!post.content) continue;

            // 고도화된 콘텐츠 정제
            let cleanContent = post.content
                .replace(/```html\n?/gi, '')
                .replace(/```markdown\n?/gi, '')
                .replace(/```\n?/g, '')
                .replace(/<!DOCTYPE html>/gi, '')
                .replace(/<html[^>]*>/gi, '')
                .replace(/<\/html>/gi, '')
                .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
                .replace(/<body[^>]*>/gi, '')
                .replace(/<\/body>/gi, '')
                .replace(/\[제목\]:?\s*/g, '') // 제목 접두어 제거
                .replace(/OOO/g, '전북배관')
                .replace(/XXX/g, '전북배관')
                .replace(/\[\s*지역\s*\]/g, post.keyword.split(' ')[0] || '전북')
                .trim();

            // 변경사항이 있으면 업데이트
            if (cleanContent !== post.content) {
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ content: cleanContent })
                    .eq('id', post.id);

                if (updateError) {
                    failed++;
                    console.error(`Failed to update ${post.id}:`, updateError);
                } else {
                    fixed++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${fixed}개 글 수정 완료, ${failed}개 실패`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
