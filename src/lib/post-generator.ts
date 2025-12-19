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
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

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

        // B. Gemini Pro (Stable) 최적화 및 프리미엄 전문가 스토리텔링 프롬프트
        const prompt = `당신은 대한민국 전북 전 지역(전주, 익산, 군산, 김제 등)에서 수천 건의 시공 실적을 보유한 '전북하수구막힘'의 수석 엔지니어이자 마케팅 전문가입니다.
Gemini Pro의 풍부한 표현력을 발휘하여, 단순히 글을 쓰는 것이 아니라 독자의 마음을 움직이고 네이버 검색 결과 상단을 점유할 수 있는 '프리미엄 콘텐츠'를 생성하세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 핵심 데이터 세팅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 메인 키워드: ${keyword}
- 동네 위치: ${fullLocation} (${shortLocation} 중심)
- 작업 서비스: ${service}
- 타겟 페르소나: ${targetAudience}
- 발생 상황: ${usageContext}
- 브랜드: 전북하수구막힘 (절대 변경 금지)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 Gemini Pro 전용 프리미엄 지침
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **전문가적 권위 (Deep Authority)**:
   - "20년 경력의 노하우로 배관의 기울기(구배)와 슬러지 고착 상태를 정확히 진단했습니다."와 같은 기술적 전문 지식을 자연스럽게 녹여내세요.
   - 단순한 '막힘'이 아닌, '유지방 고착', '배수 구배 불량', '이물질 적체' 등 전문 용어를 사용하세요.

2. **심리학적 스토리텔링 (Psychological Hook)**:
   - 도입부에서 [${targetAudience}]의 고통(Pain Point)에 깊이 공감하고, 안도감을 주는 톤으로 시작하세요.
   - "물이 역류하는 순간의 당혹감을 누구보다 잘 알기에, 연락을 받자마자 ${shortLocation} 현장으로 즉시 출발했습니다."

3. **초정밀 로컬라이징 (Hyper-Local)**:
   - ${shortLocation} 주변의 지형이나 흔한 건물 구조(빌라, 구축 아파트, 상가 밀집 지역 등)를 언급하여 실제 현장임을 증명하세요.
   - 플레이스홀더(OOO, XXX)는 절대 쓰지 말고, 구체적인 묘사를 하세요.

4. **네이버 스마트블록 SEO 레이아웃 (Rich Format)**:
   - **강렬한 제목**: 클릭할 수밖에 없는 지역명+서비스명+결과 중심의 제목 (예: "${shortLocation} 변기막힘, 뜯지 않고 5분 만에 해결한 비결은?")
   - **3줄 임팩트 요약**: 서두에서 핵심 시공 내용을 요약하여 검색 가시성 확보.
   - **체계적 리포트 (HTML Table)**: 작업 위치, 증상, 사용 장비(고성능 내시경, 플렉스 샤프트, 고압 세척기 등), 해결 결과를 표로 정리.
   - **이미지 앵커**: 포스팅 흐름에 맞춰 [IMG_1], [IMG_2], [IMG_3]를 전략적으로 배치.
   - **프리미엄 FAQ**: 고객이 가장 궁금해하는 비용, 재발 방지책, 소요 시간 등에 대해 신뢰도 높은 답변 3가지.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 금지 및 주의 사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- <html> <head> <body> 등 문서 구조 태그 금지.
- 마크다운 (\`\`\`) 기호 사용 절대 금지 (원문 텍스트만 출력).
- '전북하수구막힘' 이외의 다른 상호나 가짜 번호 사용 금지.
- Gemini Pro의 능력을 활용해 문장의 단조로움을 피하고 문장력을 극대화할 것.

작성 시작(전북 최고의 배관 전문가다운 자부심과 친절함이 담긴 목소리로):`;

        // API 키는 환경 변수에서 가져옵니다.
        const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        const MODEL = 'gemini-2.0-flash-exp'; // Changed to available experimental model
        console.log(`[PostGen] Requesting ${MODEL} for: ${keyword}`);
        const geminiResponse = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
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
