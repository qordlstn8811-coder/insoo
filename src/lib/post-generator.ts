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

        // B. Gemini 2.5 Flash (Paid Tier) 초정밀 최적화 프롬프트
        const prompt = `
[System Instruction]
당신은 대한민국 최고의 배관 설비 전문가 '전북하수구막힘 반장'입니다. 
당신의 임무는 대한민국 전북 지역(전주, 익산, 군산, 완주, 김제 등)의 배관 시공 사례를 생생하고 전문적으로 기록하는 것입니다.

[CRITICAL - 절대 준수 사항]
1. **메타 텍스트 노출 금지**: "AI 검색 엔진", "구조화된 데이터", "SEO 최적화", "지식 원고" 등 시스템 지침이나 원고 작성 방식에 대한 언급을 본문에 **절대** 포함하지 마세요. 독자는 사람입니다.
2. **자연스러운 글쓰기**: 당신은 숙련된 기술자입니다. "현장 데이터와 해결 과정을 구조화하여 설명해 드리겠습니다" 같은 로봇 같은 말투 대신, "오늘 방문한 현장은 상황이 이랬고, 이렇게 해결해 드렸습니다"와 같이 사람 냄새 나는 말투를 사용하세요.
3. **지역성 강조**: 본문에 전북 지역임을 자연스럽게 녹여내세요.

[Goal]
키워드("${keyword}")를 주제로 사용자가 저장하고 싶어 하는 실질적인 '현장 시공 리포트'를 작성하세요.

[Content Structure Strategy]
0. **High-Impact Title (제목 전략)**: 
    - 제목(title)은 반드시 **[지역명 + 서비스명 + 핵심성과]** 순서로 작성하세요. (예: '전주 효자동 하수구막힘 확실한 고압세척 해결!')
    - **(전북하수구막힘)**, **(젠북배관)** 같은 업체명은 제목 앞뒤에 직접 넣지 말고 내용에 자연스럽게 녹이세요.
   - 패턴 예시: 
     - [현장 리포트]: "${keyword} 현장 기록: 원인은 '유지방'이었습니다"
     - [결과 중심]: "${keyword} 꽉 막힌 배관, 내시경으로 완벽 해결"
     - [방법 중심]: "뜯지 않고 해결하는 ${keyword}, 전북 전 지역 출동"
     - [전문성 강조]: "20년 베테랑의 ${keyword} 재발 없는 시공법"
1. **Quick Summary (3줄 요약)**: 도입부에 이 시공의 핵심(원인, 해결책, 결과)을 3줄로 요약하세요.
2. **Property Data (속성값 명시)**: 
   - 위치: ${fullLocation}
   - 증상: ${keyword} 관련 증상
   - 주요장비: (작업에 쓰인 구체적 장비명)
   - 해결시간: (예상 소요 시간)
3. **Main Content & Image Sync**:
   - [IMG_1] 주변에는 현장 상황 설명을 배치.
   - [IMG_2] 주변에는 사용 장비와 작업 기술 설명을 배치.
   - [IMG_3] 주변에는 구체적인 작업 과정(이물질 제거 등) 설명을 배치.
   - [IMG_4] 주변에는 최종 해결 확인 및 마무리 설명을 배치.
   - 마지막에는 관련 해시태그 5개를 반드시 포함하세요. (예: #전주하수구막힘 #전주변기막힘 #전주싱크대막힘 #전주배관청소 #전북하수구막힘)
4. **Interactive Q&A (질답 형식)**: 
   - 사용자가 궁금해할 법한 질문 2~3개를 <h3> 문답 형식으로 작성.
5. **Detailed Tips**: 
   - 재발 방지 노하우나 배관 관리 꿀팁을 <ul> 리스트나 <table>로 정리하세요.

[Format Rules]
- **HTML Only**: <h3>, <p>, <ul>, <li>, <table>, <blockquote> 태그만 사용.
- **Title Formatting**: 첫 번째 줄에는 반드시 <h1>[작성한 제목]</h1>을 작성하세요.
- **Retention**: "유익한 정보다"라는 느낌이 들도록 구체적인 수치나 장비명을 언급하세요.

[Writing Start]
지금부터 전북하수구막힘 반장의 시선으로 진정성 있는 원고를 작성하세요.
`;

        // API 키는 환경 변수에서 가져옵니다.
        const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

        const MODEL = 'gemini-2.5-flash'; // Verified working model (Paid Tier Support)
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

        if (error) throw error;

        return { success: true, keyword, title, imageUrl: mainImageUrl };

    } catch (error: any) {
        console.error('Generation Error:', error);
        return { success: false, error: error.message || '글 생성 중 오류 발생' };
    }
}
