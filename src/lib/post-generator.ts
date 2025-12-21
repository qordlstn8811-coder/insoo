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

export async function generatePostAction() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`[PostGen] Operation started at: ${new Date().toISOString()}`);

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

        const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
        const targetAudience = TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)];
        const usageContext = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)];

        // A. 이미지 생성
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

        const imageUrls = imagePrompts.map((p, index) => {
            const prompt = encodeURIComponent(`${p}, realistic, photo, 4k, taken in Korea, highly detailed`);
            // 시드 범위를 대폭 늘려 중복 방지 (날짜+랜덤+인덱스)
            const seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (index * 5000);
            return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
        });

        const mainImageUrl = imageUrls[0];

        // B. Gemini 2.0 Flash (Paid Tier) 초정밀 최적화 프롬프트
        const prompt = `
[System Instruction]
당신은 대한민국 전북 지역의 배관 설비 전문가이자, 신뢰받는 동네 해결사인 '전북하수구막힘 반장'입니다. 
당신의 글은 단순한 정보 전달을 넘어, 배관 문제로 당황한 사용자에게 **기술적 전문성과 정서적 안심**을 동시에 제공해야 합니다.

[Core Identity & Voice]
- **Persona**: 15년 경력의 베테랑. 현장 상황을 한눈에 파악하고 해결책을 명확히 제시하는 전문가.
- **Tone**: 과장되지 않은 차분하고 신뢰감 있는 말투. 전문 용어를 적절히 사용하되 일반인이 이해하기 쉽게 풀어서 설명.
- **Location Pride**: 전북(전주, 익산, 군산 등) 지역 사회에 대한 애정과 책임감을 본문 곳곳에 자연스럽게 드러냄.

[CRITICAL - 절대 준수 사항]
1. **메타 데이터 및 로봇 문체 배제**: "이 원고는...", "SEO 최적화 결과...", "AI로서 답변드립니다" 같은 언급 절대 금지.
2. **현장감 극대화**: 직접 현장을 보고 느낀 점(냄새, 소리, 손끝의 감각 등)을 묘사하여 읽는 사람이 현장에 있는 것처럼 느끼게 하세요.
3. **독자 타겟팅**: 현재 상황("${usageContext}")과 독자("${targetAudience}")의 긴박함에 공감하며 해결책을 제시하세요.
4. **HTML 구조화**: 웹 가독성과 검색 엔진 최적화를 위해 시각적으로 풍성한 HTML 구조를 사용하세요.

[Goal]
키워드("${keyword}")를 중심으로, 사용자가 '이 업체는 진짜 전문가구나'라고 느낄 수 있는 고품질 **시공 리포트**를 작성하세요.

[Content Structure Strategy]
1. **Header (제목)**: <h1> 태그 사용. 
   - [지역명 + 서비스명 + 핵심 해결 전략] (예: '전주 효자동 싱크대막힘, 강력한 석션과 배관 스케일링으로 완벽 복구')
2. **Executive Summary (3줄 요약)**: <blockquote>를 사용하여 시공 전/후의 극적인 변화를 요약.
3. **Site Analysis (현장 데이터)**: <table>을 사용하여 위치, 증상, 사용 장비(내시경, 플렉시블 샤프트 등), 해결 등급을 명시.
4. **Visual Journey (본문 및 이미지 배치)**:
   - [IMG_1] 주변: 현장 방문 시의 당혹스러운 상황과 초기 진단.
   - [IMG_2] 주변: 배관 내시경으로 발견한 '범인'(유지방, 석회 등)에 대한 기술적 분석.
   - [IMG_3] 주변: 전문 장비를 투입하여 문제를 해결하는 구체적인 과정(소리, 압력 등 묘사).
   - [IMG_4] 주변: 작업 완료 후 깨끗해진 배관 확인 및 고객의 반응.
5. **Expert Insight (전문가 FAQ)**: <h3> 문답 형식으로 사용자들이 가장 두려워하는 점(재발 여부, 비용 등)을 답변.
6. **Maintenance Tip (관리 꿀팁)**: <ul> 또는 <ol> 리스트를 사용하여 일반인이 실천할 수 있는 예방법 제시.

[Formatting Rule]
- **Tags**: <h1>, <h3>, <p>, <ul>, <li>, <table>, <blockquote>, <strong>, <hr>만 사용.
- **Emphasis**: 핵심 키워드나 중요한 해결 방법은 <strong> 태그로 강조.
- **Length**: Gemini 2.0 Flash의 능력을 발휘하여 공백 제외 1,500자 이상의 풍부한 내용을 생성하세요.

[Writing Start]
이제 '전북하수구막힘 반장'으로서 배관 문제에 대한 당신만의 통찰력을 원고에 담아주세요.
`;

        // B. Gemini Model Fallback Strategy (Extended List)
        // 순서: 최신/고지능 -> 빠름/가성비 -> 구형/안정적
        const MODELS = [
            'gemini-2.0-flash-exp',   // 1. 최신 (High Intelligence)
            'gemini-1.5-pro',         // 2. 고성능 (Stable Pro)
            'gemini-1.5-flash',       // 3. 표준 (Standard Flash)
            'gemini-1.5-flash-8b',    // 4. 초고속 (High Speed)
            'gemini-1.0-pro'          // 5. 구형 (Legacy Reliability)
        ];
        let geminiData: any = null;
        let usedModel = '';
        let lastError: any = null;

        console.log(`[PostGen] Starting generation with fallback strategy. Models: ${MODELS.join(', ')}`);

        for (const model of MODELS) {
            try {
                console.log(`[PostGen] Attempting with model: ${model} for keyword: ${keyword}`);

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
                    1 // Retry only once per model internally to fail fast and switch models
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Model ${model} Error: ${response.status} ${JSON.stringify(errorData)}`);
                }

                geminiData = await response.json();

                // [Safety Check]
                if (!geminiData.candidates || geminiData.candidates.length === 0) {
                    throw new Error(`Model ${model} returned no candidates (Safety Block?)`);
                }

                usedModel = model;
                console.log(`[PostGen] Success with model: ${model}`);
                break; // Exit loop on success

            } catch (error: any) {
                console.warn(`[PostGen] Failed with ${model}: ${error.message}`);
                lastError = error;
                // Continue to next model
            }
        }

        if (!geminiData) {
            console.error('[PostGen] All models failed.');
            throw lastError || new Error('All Gemini models failed to generate content.');
        }

        console.log(`[PostGen] Processing raw text from ${usedModel}...`);
        let rawText = geminiData.candidates[0].content?.parts?.[0]?.text || '내용 생성 실패';

        rawText = rawText
            .replace(/```html\n ?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const lines = rawText.split('\n');
        let title = lines[0].replace(/<h1>|<\/h1>|제목:/g, '').trim();

        // [Fix] Deduplicate location if it appears twice in the title
        const titleParts = title.split(' ');
        const uniqueParts = titleParts.filter((item: string, index: number) => titleParts.indexOf(item) === index);
        title = uniqueParts.join(' ');

        if (title.length > 70 || title.length < 5) {
            title = `${keyword} 꼼꼼한 해결 시공기`;
        }

        let content = lines.slice(1).join('\n').trim();

        // [Fix] Remove leaked meta-instructions from content just in case
        const leakedPhrases = [
            /AI 검색 엔진과 사용자 모두가 만족할 수 있도록/g,
            /현장 데이터와 해결 과정을 구조화하여 설명해 드리겠습니다/g,
            /데이터베이스형 지식 원고를 작성하는 것입니다/g,
            /AI가 정보를 추출하기 쉽고/g
        ];
        leakedPhrases.forEach(phrase => {
            content = content.replace(phrase, '');
        });

        // Helper to safely replace IMG tags with error handling (hide broken images)
        const replaceImage = (idx: number, alt: string) => {
            if (!imageUrls[idx]) return '';
            return `<img src="${imageUrls[idx]}" alt="${alt}" onerror="this.style.display='none'" style="width:100%; border-radius:10px; margin: 20px 0;" />`;
        };

        content = content.replace(/\[IMG_1\]/g, replaceImage(0, `${keyword} 현장 모습`));
        content = content.replace(/\[IMG_2\]/g, replaceImage(1, `${keyword} 작업 과정`));
        content = content.replace(/\[IMG_3\]/g, replaceImage(2, `${keyword} 집중 시공`));
        content = content.replace(/\[IMG_4\]/g, replaceImage(3, `${keyword} 해결 완료`));

        // Clean up any remaining IMG tags that might have been hallucinated (e.g. [IMG_5], [IMG_A], etc.)
        content = content.replace(/\[IMG_[^\]]+\]/g, '');

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

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                keyword,
                title,
                content,
                image_url: mainImageUrl,
                status: 'published',
                category: '시공사례'
            }]);

        if (error) {
            console.error('[PostGen] Supabase Insert Error:', error);
            throw error;
        }

        console.log(`[PostGen] Successfully published: ${title}`);

        return { success: true, keyword, title, imageUrl: mainImageUrl };

    } catch (error: any) {
        console.error('Generation Error:', error);
        return { success: false, error: error.message || '글 생성 중 오류 발생' };
    }
}
