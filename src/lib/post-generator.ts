import { createClient } from '@supabase/supabase-js';

// Client initialization moved inside function to avoid build-time errors
// const supabase = createClient(...)

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

const INFO_TOPICS = [
    '변기 막혔을 때 뚫는 확실한 방법 (페트병, 비닐)',
    '욕실 하수구 냄새 제거하는 초간단 꿀팁',
    '싱크대 배수구 막힘 예방하는 관리법',
    '겨울철 수도계량기 동파 방지 및 대처법',
    '세면대 물이 잘 안 내려갈 때 해결 방법',
    '화장실 환풍기에서 나는 담배냄새 차단법',
    '배수구 머리카락 막힘 방지 아이템 추천',
    '보일러 배관 청소 주기와 효과 (난방비 절약)',
    '갑자기 수도세가 많이 나올 때 누수 확인법',
    '욕실 타일 곰팡이 완벽 제거 청소법'
];

async function fetchWithRetry(url: string, options: any, maxRetries = 5) {
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

export async function generatePostAction(jobType: 'auto' | 'manual' = 'auto') {
    let currentKeyword = '';
    let usedModel = 'none';

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`[PostGen] [${jobType}] Operation started at: ${new Date().toISOString()}`);

        // Determine Post Type: 20% Info, 80% Service (Case Study)
        const isInfoPost = Math.random() < 0.2; // 20% probability
        const category = isInfoPost ? '생활꿀팁' : '시공사례';
        let keyword = '';
        let prompt = '';
        let mainImageUrl = '';
        let imageUrls: string[] = [];

        // Context variables for footer
        let fullLocation = '';
        let service = '';
        let city = '';
        let displayDistrict = '';

        if (isInfoPost) {
            // [Type A] 정보성 글 (생활꿀팁)
            const topic = INFO_TOPICS[Math.floor(Math.random() * INFO_TOPICS.length)];
            keyword = topic;
            currentKeyword = keyword;

            const infoImagePrompts = [
                `professional plumber giving advice about ${topic}, friendly face, bright atmosphere`,
                `clean modern bathroom interior in Korea, sparkling clean, home improvement`,
                `diy home repair tools on table, wrench, plunger, gloves, realistic photo`,
                `happy korean family in warm living room, comfortable home environment`
            ];

            imageUrls = infoImagePrompts.map((p, index) => {
                const promptEnc = encodeURIComponent(`${p}, realistic, photo, 4k, bright lighting`);
                const seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (index * 9999);
                return `https://image.pollinations.ai/prompt/${promptEnc}?width=1024&height=768&seed=${seed}&nologo=true`;
            });
            mainImageUrl = imageUrls[0];

            prompt = `
            당신은 20년 경력의 배관 전문가이자 살림의 고수입니다.
            독자들에게 실질적인 도움이 되는 블로그 정보성 글을 작성해주세요.

            정보:
            - 주제: ${topic}
            - 타겟 독자: ${TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)]}
            - 글의 성격: 전문적이지만 친절하고 이해하기 쉬운 설명

            요청사항:
            1. 제목은 <h1> 태그로 작성하고, 클릭을 유도하는 꿀팁 형식이어야 합니다.
            2. 본문은 <h2>(소제목), <p>, <ul>, <li> 태그를 사용하여 가독성 있게 작성하세요.
            3. 준비물, 순서, 주의사항 등을 명확하게 구분해서 설명해주세요.
            4. [IMG_1], [IMG_2]를 적절한 위치에 배치하세요.
            5. 마지막에는 "그래도 해결이 안 된다면 전문가의 도움이 필요합니다"라는 톤으로 마무리하며 전북하수구막힘을 자연스럽게 언급하세요.
            6. 마크다운이 아닌 HTML 태그만 출력하세요.
            `;

        } else {
            // [Type B] 시공 사례 (기존 로직)
            fullLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
            const parts = fullLocation.split(' ');
            city = parts[0];
            const district = parts.length > 2 ? parts[1] : '';
            const dong = parts[parts.length - 1];
            displayDistrict = (district && district !== city) ? district : '';
            service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
            keyword = `${fullLocation} ${service}`;
            currentKeyword = keyword;

            const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
            const targetAudience = TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)];
            const usageContext = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];

            // 이미지 생성
            const serviceImageMap: Record<string, string[]> = {
                '변기막힘': [
                    'clogged toilet in typical Korean apartment bathroom, beige tiles, plunger nearby, realistic dirty condition, wet floor',
                    'professional plumber hands wearing red rubber gloves unblocking toilet with auger tool, close up view, mechanics tools',
                    'sparkling clean white toilet bowl after repair, modern Korean bathroom interior, bright lighting, dry floor',
                    'plumber explaining maintenance to homeowner in Korean house, professional demeanor'
                ],
                '하수구막힘': [
                    'overflowing floor drain in Korean wet room bathroom, soapy water puddle, typical Korean apartment shower area',
                    'plumber using heavy duty flexible shaft machine for sewer cleaning, construction site dirty gloves, yellow equipment',
                    'clean floor drain water flowing smoothly in Korean style bathroom, grey tiles, no water standing',
                    'professional plumber checking sewer with flashlight, dirty pipes, working environment'
                ],
                '싱크대막힘': [
                    'kitchen sink filled with dirty yellowish water and food waste, typical Korean home kitchen sink strainer blocked',
                    'plumber opening under sink cabinet revealing pvc grey pipes and P-trap, flashlight beam, tools on floor',
                    'clean stainless steel kitchen sink empty and shiny, water running from faucet, clean kitchen counter',
                    'removing large grease chunk from kitchen drain pipe, dirty grease, professional extraction'
                ],
                '수도설비': [
                    'leaking water pipe spraying water under sink, wet floor, panic emergency situation, water puddles',
                    'professional installing new boiler connection pipes, insulation foam, neat work, wrench in hand',
                    'newly replaced shiny silver water pipes, construction finished, neat organization, professional finish',
                    'testing water pressure after faucet installation, clear running water, chrome finish'
                ],
                '배관청소': [
                    'endoscope camera screen showing sludge gunk inside old rusty pipe, yellow grease, dirty disgusting view',
                    'high pressure water jet cleaning rusty pipe interior, splashing water action shot, hydro jetting nozzle',
                    'perfectly clean inside of pipe after cleaning, smooth surface, bright light reflection, like new pipe',
                    'plumber carrying high pressure jetting equipment into a Korean building, heavy duty setup'
                ],
                '누수탐지': [
                    'damp moldy water stain on beige wallpaper ceiling, water damage detail, peeling paint',
                    'thermal imaging camera screen showing blue cold spot leak on floor, professional device screen',
                    'plumber with headset listing to floor leak using acoustic detector device, concentration, professional equipment',
                    'repairing small puncture in copper water pipe, specialized tools, precision work'
                ]
            };

            const imagePrompts = serviceImageMap[service] || [
                'Korean plumbing emergency water leak messy floor',
                'professional plumber identifying pipe problem with tools',
                'advanced plumbing equipment working on clogged pipe',
                'clean restored bathroom happy atmosphere'
            ];

            imageUrls = imagePrompts.map((p, index) => {
                const promptEnc = encodeURIComponent(`${p}, realistic, photo, 4k, taken in Korea, highly detailed`);
                const seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (index * 5000);
                return `https://image.pollinations.ai/prompt/${promptEnc}?width=1024&height=768&seed=${seed}&nologo=true`;
            });
            mainImageUrl = imageUrls[0];

            prompt = `
            당신은 20년 경력의 베테랑 배관 전문가이자 블로그 마케팅 전문가입니다.
            아래 정보를 바탕으로 고객의 신뢰를 얻을 수 있는 전문적인 블로그 포스팅을 작성해주세요.

            정보:
            - 핵심 키워드: ${keyword}
            - 글의 형식: ${template}
            - 타겟 독자: ${targetAudience}
            - 상황 연출: ${usageContext}

            요청사항:
            1. 글의 제목은 <h1> 태그로 작성하고, 클릭을 유도하는 매력적인 문구여야 합니다.
            2. 본문은 <h2>, <p>, <ul>, <li> 태그를 적절히 사용하여 가독성을 높여주세요.
            3. [IMG_1], [IMG_2], [IMG_3], [IMG_4]를 적절한 위치에 삽입하여 현장감을 살려주세요.
            4. 말투는 친절하고 전문적이어야 하며, 공감을 이끌어내는 스토리텔링 방식을 사용하세요.
            5. 마크다운이 아닌 적절한 HTML 포맷으로 출력해주세요. (html, head, body 태그 제외)
            `;
        }

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
                break; // Success
            } catch (error: any) {
                console.warn(`[PostGen] Failed with ${model}: ${error.message}`);
                lastError = error;
            }
        }

        if (!geminiData) throw lastError || new Error('All Gemini models failed.');

        let rawText = geminiData.candidates[0].content?.parts?.[0]?.text || '내용 생성 실패';

        // Remove code blocks and common HTML wrappers
        rawText = rawText
            .replace(/```html\n ?/g, '')
            .replace(/```\n?/g, '')
            .replace(/<!DOCTYPE[^>]*>/gi, '')
            .replace(/<html[^>]*>/gi, '')
            .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
            .replace(/<body[^>]*>/gi, '')
            .replace(/<\/body>/gi, '')
            .replace(/<\/html>/gi, '')
            .trim();

        const lines = rawText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        let title = lines[0] ? lines[0].replace(/<h1>|<\/h1>|제목:/g, '').trim() : `${keyword} 해결 시공기`;

        // [Fix] 지역명 중복 제거 (예: '전주 완산구 서신동 전주 완산구 서신동 ...')
        const titleWords = title.split(' ');
        const uniqueWords: string[] = [];
        titleWords.forEach((word: string) => {
            if (!uniqueWords.includes(word)) uniqueWords.push(word);
        });
        title = uniqueWords.join(' ');

        if (title.length > 70 || title.length < 5) {
            title = isInfoPost ? `${keyword} 핵심 정보 정리` : `${keyword} 꼼꼼한 해결 시공기`;
        }

        let content = lines.slice(1).join('\n').trim();

        const replaceImage = (idx: number, alt: string) => {
            if (!imageUrls[idx]) return '';
            return `<img src="${imageUrls[idx]}" alt="${alt}" onerror="this.style.display='none'" style="width:100%; border-radius:10px; margin: 20px 0;" />`;
        };

        content = content.replace(/\[IMG_1\]/g, replaceImage(0, `${keyword} 현장 모습`));
        content = content.replace(/\[IMG_2\]/g, replaceImage(1, `${keyword} 작업 과정`));
        content = content.replace(/\[IMG_3\]/g, replaceImage(2, `${keyword} 집중 시공`));
        content = content.replace(/\[IMG_4\]/g, replaceImage(3, `${keyword} 해결 완료`));
        content = content.replace(/\[IMG_[^\]]+\]/g, '');

        if (isInfoPost) {
            content += `
            <hr style="margin: 40px 0;" />
            <h3>💡 더 많은 배관 꿀팁이 궁금하다면?</h3>
            <p><strong>전북하수구막힘 블로그</strong>에서 다양한 정보를 확인하세요.</p>
            <p>혼자 해결하기 어려운 문제는 언제든 전문가에게 문의해주세요!</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="${NAVER_PLACE_URLS['default']}" target="_blank" style="background-color: #03C75A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em;">
                    문의하기 (네이버 지도) 🚀
                </a>
            </p>
            `;
        } else {
            const placeUrl = NAVER_PLACE_URLS[service] || NAVER_PLACE_URLS['default'];
            content += `
                <hr style="margin: 40px 0;" />
                <h3>📍 ${fullLocation} ${service} 해결 전문!</h3>
                <p><strong>전북 전 지역(${city}${displayDistrict ? ', ' + displayDistrict : ''}) 30분 내 긴급 출동!</strong></p>
                <p>더 많은 시공 사례와 정확한 위치는 아래 지도에서 확인해주세요.</p>
                <p style="text-align: center; margin-top: 20px;">
                    <a href="${placeUrl}" target="_blank" style="background-color: #03C75A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em;">
                        전북하수구막힘 네이버 지도 보기 🚀
                    </a>
                </p>
            `;
        }

        const { error } = await supabase
            .from('posts')
            .insert([{
                keyword,
                title,
                content,
                image_url: mainImageUrl,
                status: 'published',
                category: category
            }]);

        if (error) throw error;

        // 성공 로그 기록
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

        // 실패 로그 기록 (Supabase 클라이언트 재초기화 필요할 수 있음)
        try {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            await supabase.from('cron_logs').insert([{
                job_type: jobType,
                status: 'failure',
                keyword: currentKeyword,
                error_message: error.message || 'Unknown Error',
                model_used: usedModel
            }]);
        } catch (logError) {
            console.error('[PostGen] Critical: Failed to record failure log!', logError);
        }

        return { success: false, error: error.message || '글 생성 중 오류 발생' };
    }
}

