import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. 설정
const CITIES = ['전주', '군산', '익산', '김제', '완주'];
const SERVICES = ['변기막힘', '하수구막힘', '싱크대막힘', '수도설비', '배관청소', '누수탐지'];
const API_KEY = 'AIzaSyBgvewNyf2yAyybqmyHdbAa8lq7fL453U0';

// 다양한 글 템플릿
const ARTICLE_TEMPLATES = [
    'case_study', // 시공사례
    'how_to_guide', // 해결 가이드
    'prevention_tips', // 예방 팁
    'emergency_response', // 긴급 대응
    'comparison', // 비교 분석
];

// 재시도 함수
async function fetchWithRetry(url: string, options: any, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);

            if (response.status === 503 && i < maxRetries - 1) {
                const waitTime = (i + 1) * 2000;
                console.log(`503 오류, ${waitTime / 1000}초 후 재시도...`);
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

export async function POST(request: Request) {
    try {
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
        const keyword = `${city} ${service}`;
        const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];

        const prompt = `당신은 전북 지역 배관 설비 전문가입니다.
주제: ${keyword}
글 유형: ${template}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 필수 준수 사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **출력 형식**
   - 순수 HTML만 사용 (마크다운, 코드블록 절대 금지)
   - DOCTYPE, <html>, <head>, <body> 태그 사용 금지
   - 바로 <h3>로 시작

2. **사용 가능한 HTML 태그**
   - <h3>제목</h3>
   - <p>문단</p>
   - <ul><li>리스트</li></ul>
   - <strong>강조</strong>

3. **글 구조 (${template}에 맞게)**

${template === 'case_study' ? `
   <h3>🚗 현장 도착 및 상황 파악</h3>
   <p>고객님의 연락을 받고 ${city} 현장에 즉시 출동했습니다. 현장에 도착하여 상황을 확인한 결과, [구체적 상황 2-3문장]</p>
   
   <h3>🔍 원인 분석</h3>
   <p>${service}의 주요 원인은 다음과 같습니다:</p>
   <ul>
   <li><strong>원인 1:</strong> 구체적 설명</li>
   <li><strong>원인 2:</strong> 구체적 설명</li>
   <li><strong>원인 3:</strong> 구체적 설명</li>
   </ul>
   
   <h3>🔧 전문 작업 진행</h3>
   <p>문제 해결을 위해 다음과 같은 전문 장비와 기술을 투입했습니다:</p>
   <ul>
   <li><strong>1단계:</strong> [장비명] 사용하여 [작업 내용]</li>
   <li><strong>2단계:</strong> [기술명] 적용하여 [작업 내용]</li>
   <li><strong>3단계:</strong> 최종 점검 및 테스트</li>
   </ul>
   
   <h3>✅ 완벽한 해결 및 고객 만족</h3>
   <p>작업 완료 후 테스트 결과, [구체적 개선 사항]을 확인했습니다. 고객님께서는 매우 만족해하셨습니다.</p>
` : template === 'how_to_guide' ? `
   <h3>📌 ${service} 증상 확인하기</h3>
   <p>${city} 지역에서 자주 발생하는 ${service} 증상들을 알아보겠습니다:</p>
   <ul>
   <li>증상 1</li>
   <li>증상 2</li>
   <li>증상 3</li>
   </ul>
   
   <h3>🏠 집에서 시도해볼 수 있는 방법</h3>
   <p>전문가를 부르기 전에 먼저 시도해볼 수 있는 간단한 방법들입니다:</p>
   <ul>
   <li><strong>방법 1:</strong> 구체적 설명</li>
   <li><strong>방법 2:</strong> 구체적 설명</li>
   <li><strong>방법 3:</strong> 구체적 설명</li>
   </ul>
   
   <h3>⚠️ 전문가가 필요한 경우</h3>
   <p>다음과 같은 경우에는 반드시 전문가의 도움이 필요합니다:</p>
   <ul>
   <li>상황 1</li>
   <li>상황 2</li>
   <li>상황 3</li>
   </ul>
   
   <h3>🔧 전북배관의 전문 해결 방법</h3>
   <p>전북배관은 최신 장비와 20년 경력으로 [구체적 해결 방법]을 제공합니다.</p>
` : template === 'prevention_tips' ? `
   <h3>💡 ${service} 예방이 중요한 이유</h3>
   <p>${city} 지역 특성상 ${service}이 자주 발생합니다. 예방만 잘해도 90% 이상 막을 수 있습니다.</p>
   
   <h3>📅 일상 관리 체크리스트</h3>
   <ul>
   <li><strong>매일:</strong> 구체적 관리 방법</li>
   <li><strong>매주:</strong> 구체적 관리 방법</li>
   <li><strong>매월:</strong> 구체적 관리 방법</li>
   </ul>
   
   <h3>🚫 절대 하지 말아야 할 행동</h3>
   <p>다음 행동들은 ${service}을 악화시킬 수 있습니다:</p>
   <ul>
   <li>금지 사항 1</li>
   <li>금지 사항 2</li>
   <li>금지 사항 3</li>
   </ul>
   
   <h3>🔍 정기 점검의 중요성</h3>
   <p>전북배관의 무료 정기 점검 서비스로 문제를 미리 예방하세요.</p>
` : `
   <h3>🚨 긴급 상황 발생!</h3>
   <p>${city}에서 ${service} 긴급 상황이 발생했을 때 대처 방법을 알려드립니다.</p>
   
   <h3>⏰ 골든타임 30분</h3>
   <p>${service}은 초기 대응이 매우 중요합니다. 다음 순서로 즉시 대처하세요:</p>
   <ul>
   <li><strong>1분 이내:</strong> 즉시 행동</li>
   <li><strong>5분 이내:</strong> 응급 조치</li>
   <li><strong>30분 이내:</strong> 전문가 호출</li>
   </ul>
   
   <h3>📞 전북배관 긴급 출동</h3>
   <p>24시간 긴급 출동 시스템으로 ${city} 전 지역 30분 내 도착합니다.</p>
   
   <h3>💰 긴급 출동 비용</h3>
   <p>투명한 비용 안내와 사후 AS까지 책임집니다.</p>
`}

   <h3>💡 예방 및 관리 팁</h3>
   <ul>
   <li>정기적으로 [예방법 1]</li>
   <li>[예방법 2]를 습관화하세요</li>
   <li>문제 발생 시 즉시 전문가에게 연락</li>
   </ul>
   
   <h3>📞 전북배관 연락처</h3>
   <p><strong>전북 전 지역 출장 가능</strong>합니다. 24시간 긴급 출동 서비스 제공!</p>
   <p>📞 <strong>010-8184-3496</strong></p>
   <p>빠르고 정확한 해결, 합리적인 가격으로 보답하겠습니다.</p>

4. **작성 스타일**
   - 친절하고 전문적인 말투
   - 이모지 적절히 사용 (각 h3마다 1개)
   - 문단은 2-3문장으로 짧게
   - 구체적인 숫자와 사례 포함
   - **회사명은 반드시 "전북배관"으로 작성**
   - 예: "전북배관입니다", "전북배관이 해결해드립니다"

5. **SEO 키워드 자연스럽게 포함**
   - ${keyword} (주요 키워드)
   - ${city} 배관업체
   - ${service} 전문
   - 24시간 긴급출동
   - 전북 전 지역

6. **분량**
   - 총 1500-2000자
   - 각 섹션 균형있게 배분

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

위 형식을 정확히 따라 작성하세요. 첫 줄부터 바로 <h3>로 시작하세요.`;

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
                        temperature: 0.8,
                        maxOutputTokens: 2000
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            throw new Error(`Gemini API Error: ${geminiResponse.status} ${JSON.stringify(errorData)}`);
        }

        const geminiData = await geminiResponse.json();
        let content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '내용 생성 실패';

        // 마크다운 코드블록 및 불필요한 HTML 제거
        content = content
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/<!DOCTYPE html>/gi, '')
            .replace(/<html[^>]*>/gi, '')
            .replace(/<\/html>/gi, '')
            .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
            .replace(/<body[^>]*>/gi, '')
            .replace(/<\/body>/gi, '')
            .trim();

        const title = `${keyword} 전문 해결 후기 (전북배관)`;

        // C. 이미지 생성
        const serviceImageMap: Record<string, string> = {
            '변기막힘': 'professional plumber repairing clogged toilet in clean modern bathroom',
            '하수구막힘': 'plumber cleaning drain pipe with professional equipment',
            '싱크대막힘': 'plumber fixing kitchen sink drain professionally',
            '수도설비': 'plumber installing water pipe system',
            '배관청소': 'plumber cleaning pipes with high pressure equipment',
            '누수탐지': 'plumber detecting water leak with professional tools'
        };

        const imagePrompt = serviceImageMap[service] || 'professional plumber working on pipes';
        const encodedPrompt = encodeURIComponent(imagePrompt);
        const randomSeed = Math.floor(Math.random() * 10000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&seed=${randomSeed}&nologo=true&enhance=true`;

        // D. 저장
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                keyword,
                title,
                content,
                image_url: imageUrl,
                status: 'published',
                category: '시공사례'
            }])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, keyword, title, imageUrl });

    } catch (error: any) {
        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || '글 생성 중 오류 발생' }, { status: 500 });
    }
}
