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
            // 시드 범위를 대폭 늘려 중복 방지 (날짜+랜덤+인덱스)
            const seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (index * 5000);
            return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
        });

        const mainImageUrl = imageUrls[0];

        // B. Gemini 1.5 Flash 최적화 및 전문 스토리텔링 프롬프트
        const prompt = `당신은 대한민국 전북 지역에서 20년 이상 배관 설비 및 고압 세척을 전문으로 해온 '전북배관'의 수석 엔지니어이자 전문 스토리텔러입니다.
당신의 목표는 단순한 정보 전달을 넘어, 독자에게 신뢰감을 주고 네이버 스마트블록 SEO 최적화 메커니즘을 완벽히 만족시키는 고품질 블로그 포스팅을 작성하는 것입니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 컨텍스트 및 변수
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 메인 키워드: ${keyword}
- 작성 스타일: ${template} (전문적 가이드와 현장감이 살아있는 스토리텔링 결합)
- 타겟 독자: ${targetAudience} (현재 매우 다급하고 위로와 해결책이 필요한 상태)
- 핵심 상황: ${usageContext}
- 활동 지역: ${fullLocation} (동네 이름: ${shortLocation} 강조)
- 브랜드 명칭: '전북배관' (반드시 실제 명칭 사용, OOO/XXX 절대 금지)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Gemini 1.5 Flash 최적화 지침 (Advanced Storytelling)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **현장의 생생한 소리 (Vivid Storytelling)**:
   - 도입부에서 "${targetAudience}"의 다급한 심정을 묘사하세요. 
   - **대화체 포함**: "사장님, 물이 안 내려가고 계속 역류해요! 어쩌죠?" 하는 고객의 목소리를 인용하여 현장감을 극대화하세요.
   - 예: "${shortLocation} 고객님의 떨리는 목소리를 듣고, 장비를 챙겨 신속하게 현장으로 출동했습니다."

2. **기술적 전문성 & 데이터 기반 (Technical Depth)**:
   - 작업 과정 설명 시 '그냥 뚫었다'가 아닌, "배관 내시경으로 확인한 결과 고착된 유지방 덩어리가 원인이었으며, 이를 플렉스 샤프트 장비로 정밀 스케일링하여 신축 배관 상태로 복원했습니다"와 같이 구체적인 장비명과 기술적 근거를 제시하세요.

3. **플레이스홀더 및 기호 사용 절대 금지**:
   - 'OO', 'XX', '[지역]' 등 모든 기호를 구체적인 단어로 치환하세요. 
   - 아파트 이름 등은 반드시 추측 가능하거나 가공된 실제 명칭(예: ${shortLocation} 현대아이파크, ${shortLocation} 빌라촌 등)을 자연스럽게 창작하여 넣으세요.

4. **네이버 SEO 레이아웃 (HTML 구조)**:
   - **첫 줄**: [제목] (키워드가 포함된 클릭을 부르는 임팩트 있는 제목)
   - **⚡ 핵심 요약 (Highlight)**: 3문장 이내로 작업 내용을 요약하여 상단 노출 확률 증대.
   - **📊 현장 리포트 (Table)**: <table> 태그를 사용하여 위치, 건물타입, 증상, 장비, 소요시간을 명확히 표기.
   - **📸 이미지 배치**: [IMG_1], [IMG_2], [IMG_3]를 각 섹션의 흐름에 맞게 배치.
   - **💡 전문가의 솔루션 (Callout)**: 일반인용 팁이 아닌, 전문가만 아는 유지보수 비법(예: 고압세척의 주기, 배관 기울기 등) 제언.
   - **💬 심층 FAQ (Trust)**: 이 상황에서 고객이 가질 수 있는 가장 현실적인 고민 3가지를 질답 형식으로 작성.

5. **금지 사항**:
   - <html>, <head>, <body>, <title> 태그 사용 불가.
   - 마크다운 (\`\`\`) 형식 출력 금지 (오직 원시 텍스트와 HTML 본문 태그만).
   - 무의미한 인사말 반복 금지.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
작성 시작(생생한 현장감과 전문 엔지니어의 톤으로): `;

        // API 키는 환경 변수에서 가져옵니다.
        const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        console.log(`[PostGen] Requesting Gemini 2.0 Flash for: ${keyword}`);
        const geminiResponse = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
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
        console.log(`[PostGen] Gemini response received for: ${keyword}`);
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
            <p><strong>전북 전 지역(${city}${displayDistrict ? ', ' + displayDistrict : ''}) 30분 내 긴급 출동!</strong></p>
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
