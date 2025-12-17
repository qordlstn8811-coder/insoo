import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
            if (response.status === 503 && i < maxRetries - 1) {
                const waitTime = (i + 1) * 2000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    throw new Error('최대 재시도 횟수 초과');
}

export async function generatePostAction() {
    try {
        const fullLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const parts = fullLocation.split(' ');
        const city = parts[0];
        const district = parts.length > 2 ? parts[1] : '';
        const dong = parts[parts.length - 1];

        const shortLocation = dong || district || city;
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
                'sparkling clean white toilet bowl after repair, modern Korean bathroom interior, bright lighting, dry floor'
            ],
            '하수구막힘': [
                'overflowing floor drain in Korean wet room bathroom, soapy water puddle, typical Korean apartment shower area',
                'plumber using heavy duty flexible shaft machine for sewer cleaning, construction site dirty gloves, yellow equipment',
                'clean floor drain water flowing smoothly in Korean style bathroom, grey tiles, no water standing'
            ],
            '싱크대막힘': [
                'kitchen sink filled with dirty yellowish water and food waste, typical Korean home kitchen sink strainer blocked',
                'plumber opening under sink cabinet revealing pvc grey pipes and P-trap, flashlight beam, tools on floor',
                'clean stainless steel kitchen sink empty and shiny, water running from faucet, clean kitchen counter'
            ],
            '수도설비': [
                'leaking water pipe spraying water under sink, wet floor, panic emergency situation, water puddles',
                'professional installing new boiler connection pipes, insulation foam, neat work, wrench in hand',
                'newly replaced shiny silver water pipes, construction finished, neat organization, professional finish'
            ],
            '배관청소': [
                'endoscope camera screen showing sludge gunk inside old rusty pipe, yellow grease, dirty disgusting view',
                'high pressure water jet cleaning rusty pipe interior, splashing water action shot, hydro jetting nozzle',
                'perfectly clean inside of pipe after cleaning, smooth surface, bright light reflection, like new pipe'
            ],
            '누수탐지': [
                'damp moldy water stain on beige wallpaper ceiling, water damage detail, peeling paint',
                'thermal imaging camera screen showing blue cold spot leak on floor, professional device screen',
                'plumber with headset listing to floor leak using acoustic detector device, concentration, professional equipment'
            ]
        };

        const imagePrompts = serviceImageMap[service] || [
            'Korean plumbing emergency water leak messy floor',
            'professional plumber identifying pipe problem with tools',
            'clean restored bathroom happy atmosphere'
        ];

        const imageUrls = imagePrompts.map((p, index) => {
            const prompt = encodeURIComponent(`${p}, realistic, photo, 4k, taken in Korea, highly detailed`);
            const seed = Math.floor(Math.random() * 50000) + (index * 1000);
            return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
        });

        const mainImageUrl = imageUrls[0];

        // B. Gemini 프롬프트
        const prompt = `당신은 전북 지역 20년 경력의 배관 설비 전문가 '전북배관'의 블로그 작가입니다.
주제: ${keyword}
글 유형: ${template}
타겟 독자: ${targetAudience}
상황 설정: ${usageContext}
지역: ${fullLocation} (${shortLocation})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 작성 지침 (네이버 스마트블록 SEO & 가독성 최적화)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **글 구조 (반드시 준수)**
   - **첫 줄**: [제목] (키워드를 포함한 매력적인 제목을 한 줄로 작성. 이모지 1개 포함 가능)
   - **서론 (공감 형성)**: ${shortLocation}에 거주하는 ${targetAudience}의 입장에서 겪는 불편함. "${usageContext}" 상황을 실감나게 묘사. 전문가 방문 약속.
   - **본문 1 [현장 진단]**: [IMG_1] 태그 삽입. 현장에 도착하니 상황이 어땠는지 구체적으로 설명 (냄새, 역류, 불편함 등).
   - **본문 2 [원인 파악]**: 전문가적 시선에서 정확한 원인 설명 (예: 물티슈, 음식물, 머리카락, 노후 배관 등). 왜 이런 일이 생겼는지 분석.
   - **본문 3 [작업 과정]**: [IMG_2] 태그 삽입. '전북배관'만의 노하우와 최신 장비(내시경, 샤프트기, 고압세척기 등)를 사용하여 해결하는 과정 상세 기술.
   - **본문 4 [해결 완료]**: [IMG_3] 태그 삽입. 시원하게 뚫린 모습. 배수 테스트 진행. 고객님의 안도하는 반응.
   - **맺음말 (팁 & 홍보)**: 재발 방지를 위한 실생활 꿀팁 1가지 + 확실한 AS 보장 + 전북 전 지역 출동 안내.

2. **이미지 배치**
   - 글 중간중간에 반드시 \`[IMG_1]\`, \`[IMG_2]\`, \`[IMG_3]\` 마커를 각 문단(본문1, 3, 4) 부근에 적절히 배치하세요.

3. **SEO & 키워드 전략**
   - **메인 키워드**: "${fullLocation} ${service}" (제목 및 본문 상단 자연스럽게 1~2회)
   - **서브 키워드**: "${shortLocation} ${service} 업체", "${district} 설비", "전북배관", "${city} ${service} 잘하는곳"
   - 본문에 위 키워드들을 기계적이지 않고 문맥에 맞게 자연스럽게 5~8회 녹여내세요.

4. **출력 형식 (HTML)**
   - <html>, <head>, <body>, \`\`\`html 등 불필요한 태그 절대 금지.
   - 오직 <h3>, <p>, <ul>, <li>, <strong> 태그만 사용하여 본문 내용만 출력하세요.
   - **중요**: 응답의 맨 첫 줄은 반드시 '제목'이어야 합니다. HTML 태그 없이 텍스트로만 작성하세요.

5. **말투 (페르소나)**
   - "현장에 도착해보니~", "확인해보았습니다." 처럼 현장감 넘치는 문체 사용.
   - 독자에게 친절하게 설명하듯 쓰되, 전문성을 잃지 않는 톤.
   - "~습니다", "~해요" 적절히 혼용하여 자연스럽게.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작성 시작: `;

        const geminiResponse = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${API_KEY}`,
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
            }
        );

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(`Gemini API Error: ${geminiResponse.status} ${JSON.stringify(errorData)}`);
        }

        const geminiData = await geminiResponse.json();
        let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '내용 생성 실패';

        rawText = rawText
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const lines = rawText.split('\n');
        let title = lines[0].replace('제목:', '').trim();
        if (title.length > 50 || title.length < 5) {
            title = `${keyword} 꼼꼼한 해결 시공기 (전북배관)`;
        }

        let content = lines.slice(1).join('\n').trim();

        content = content.replace('[IMG_1]', `<img src="${imageUrls[0]}" alt="${keyword} 현장 모습" style="width:100%; border-radius:10px; margin: 20px 0;" />`);
        content = content.replace('[IMG_2]', `<img src="${imageUrls[1]}" alt="${keyword} 작업 과정" style="width:100%; border-radius:10px; margin: 20px 0;" />`);
        content = content.replace('[IMG_3]', `<img src="${imageUrls[2]}" alt="${keyword} 해결 완료" style="width:100%; border-radius:10px; margin: 20px 0;" />`);

        const placeUrl = NAVER_PLACE_URLS[service] || NAVER_PLACE_URLS['default'];

        content += `
            <hr style="margin: 40px 0;" />
            <h3>📍 ${fullLocation} ${service} 해결 전문!</h3>
            <p><strong>전북 전 지역(${city}, ${district || city}) 30분 내 긴급 출동!</strong></p>
            <p>더 많은 시공 사례와 정확한 위치는 아래 지도에서 확인해주세요.</p>
            <p style="text-align: center; margin-top: 20px;">
                <a href="${placeUrl}" target="_blank" style="background-color: #03C75A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em;">
                    전북배관 네이버 지도 보기 🚀
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

        if (error) throw error;

        return { success: true, keyword, title, imageUrl: mainImageUrl };

    } catch (error: any) {
        console.error('Generation Error:', error);
        return { success: false, error: error.message || '글 생성 중 오류 발생' };
    }
}
