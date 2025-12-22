
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// --- MOCKED CONSTANTS FROM post-generator.ts ---
const LOCATIONS = [
    '전주 완산구 효자동', '전주 완산구 평화동', '전주 완산구 삼천동', '전주 완산구 중화산동', '전주 완산구 서신동', '전주 완산구 서서학동',
    '전주 덕진구 송천동', '전주 덕진구 인후동', '전주 덕진구 만성동', '전주 덕진구 반월동', '전주 덕진구 여의동', '전주 덕진구 팔복동',
    '전주 에코시티', '전주 혁신도시',
    '익산 모현동', '익산 영등동', '익산 부송동', '익산 어양동', '익산 삼성동',
    '군산 수송동', '군산 나운동', '군산 조촌동', '군산 미룡동', '군산 지곡동',
    '완주 봉동읍', '완주 이서면', '완주 삼례읍', '김제 요촌동', '김제 검산동'
];

const SERVICES = ['변기막힘', '하수구막힘', '싱크대막힘', '수도설비', '배관청소', '누수탐지'];
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const NAVER_PLACE_URLS: Record<string, string> = {
    '변기막힘': 'https://naver.me/FjCEaKcf',
    '하수구막힘': 'https://naver.me/xenVtpVr',
    'default': 'https://naver.me/xenVtpVr'
};

const ARTICLE_TEMPLATES = [
    'case_study', 'how_to_guide', 'prevention_tips', 'emergency_response', 'comparison',
];

const TARGET_AUDIENCES = [
    '화장실을 급하게 써야 하는 다급한 주부',
    '점심 장사를 망칠까 봐 걱정하는 식당 사장님',
    '퇴근 후 배수구 냄새 때문에 스트레스 받는 30대 직장인',
    '세입자 민원을 해결해야 하는 원룸 건물주',
    '아이들이 물을 잘 내려서 걱정인 학원 원장님',
    '갑자기 물이 안 내려가 당황한 신혼부부'
];

const CONTEXTS = [
    '갑자기 날씨가 추워지면서 배관이 얼었을 가능성',
    '장마철 습기 때문에 악취가 더 심해지고 물이 역류하는 상황',
    '주말이라 관리사무소 연락이 어려운 상황',
    '손님이 오기로 했는데 갑자기 막힌 난감한 상황',
    '셀프로 뚫어보려다 옷걸키가 박혀버려 오히려 더 꽉 막혀버린 상황'
];

async function fetchWithRetry(url: string, options: any, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);

            // 503(Service Unavailable) 또는 429(Too Many Requests) 처리
            if ((response.status === 503 || response.status === 429) && i < maxRetries - 1) {
                // 지수 백오프: 2s, 4s, 8s... + 랜덤 지터
                const backoffTime = Math.pow(2, i + 1) * 1000;
                const jitter = Math.random() * 1000;
                const waitTime = backoffTime + jitter;

                console.warn(`[API] ${response.status} detected. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const waitTime = Math.pow(2, i + 1) * 1000;
            console.warn(`[API] Fetch error. Retrying in ${waitTime}ms...`, error);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    throw new Error('최대 재시도 횟수 초과 또는 API 사용 제한');
}

async function generatePostAction(jobType: 'auto' | 'manual' = 'auto') {
    let currentKeyword = '';
    let usedModel = 'none';

    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing Supabase Environment Variables');
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`[PostGen] [${jobType}] Operation started at: ${new Date().toISOString()}`);

        const fullLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const parts = fullLocation.split(' ');
        const city = parts[0];
        // 구/읍/면이 있는 경우 처리
        const district = parts.length > 2 ? parts[1] : '';
        const dong = parts[parts.length - 1];

        // 중복 방지를 위해 city와 district가 같지 않을 때만 district 표시
        const displayDistrict = (district && district !== city) ? district : '';
        const shortLocation = dong || displayDistrict || city;
        const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
        const keyword = `${fullLocation} ${service}`;
        currentKeyword = keyword;

        console.log(`Target Keyword: ${keyword}`);

        const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
        const targetAudience = TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)];
        const usageContext = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];

        // A. 이미지 생성 logic omitted for brevity, using dummy placeholders
        // But the user's code generates URLs from Pollinations. Let's keep that to test timeouts.
        const serviceImageMap: Record<string, string[]> = {
            '변기막힘': ['toilet'], '하수구막힘': ['drain'], '싱크대막힘': ['sink'], '수도설비': ['pipe'], '배관청소': ['cleaning'], '누수탐지': ['leak']
        };
        const imagePrompts = serviceImageMap[service] || ['plumbing'];
        const imageUrls = imagePrompts.map((p, index) => {
            const prompt = encodeURIComponent(`${p} realistic plumbing`);
            const seed = Math.floor(Date.now() / 1000) + index;
            return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
        });
        const mainImageUrl = imageUrls[0];
        console.log(`Generated Image URL: ${mainImageUrl}`);

        // C. Prompt Construction
        const prompt = `
        키워드: ${keyword}
        형식: ${template}
        독자: ${targetAudience}
        상황: ${usageContext}
        제목은 <h1> 태그로, 본문은 HTML로 작성해줘. [IMG_1]~[IMG_4] 포함.
        `;

        // B. Gemini Model Fallback Strategy
        const MODELS = [
            'gemini-2.0-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];
        let geminiData: any = null;
        let lastError: any = null;

        for (const model of MODELS) {
            usedModel = model;
            console.log(`Trying model: ${model}...`);
            try {
                const response = await fetchWithRetry(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: prompt }]
                            }],
                            generationConfig: {
                                temperature: 0.85,
                                maxOutputTokens: 4000
                            }
                        })
                    },
                    1
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Model ${model} Error: ${response.status} ${JSON.stringify(errorData)}`);
                }

                geminiData = await response.json();
                if (!geminiData.candidates || geminiData.candidates.length === 0) {
                    throw new Error(`Model ${model} returned no candidates`);
                }
                console.log(`Success with model: ${model}`);
                break; // Success
            } catch (error: any) {
                console.warn(`[PostGen] Failed with ${model}: ${error.message}`);
                lastError = error;
            }
        }

        if (!geminiData) throw lastError || new Error('All Gemini models failed.');

        let rawText = geminiData.candidates[0].content?.parts?.[0]?.text || '내용 생성 실패';
        // Cleanup text
        rawText = rawText.replace(/```html\n ?/g, '').replace(/```\n?/g, '').trim();
        const lines = rawText.split('\n');
        let title = lines[0].replace(/<h1>|<\/h1>|제목:/g, '').trim();
        let content = lines.slice(1).join('\n').trim();

        console.log(`Generated Title: ${title}`);

        // DB Insert
        console.log('Inserting into Supabase...');
        const { error } = await supabase
            .from('posts')
            .insert([{
                keyword,
                title,
                content,
                image_url: mainImageUrl,
                status: 'published',
                category: '시공사례'
            }]);

        if (error) throw error;

        // Log success
        await supabase.from('cron_logs').insert([{
            job_type: jobType,
            status: 'success',
            keyword: keyword,
            title: title,
            model_used: usedModel
        }]);

        console.log(`[PostGen] Successfully published: ${title}`);
        return { success: true, keyword, title, imageUrl: mainImageUrl };

    } catch (error: any) {
        console.error('Generation Error:', error);
        return { success: false, error: error.message || '글 생성 중 오류 발생' };
    }
}

// RUN
generatePostAction('manual');
