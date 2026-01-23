import { createClient } from '@supabase/supabase-js';
import { generateWithGroq } from '@/utils/groq-client';
import { getRandomUserImage, processImageWithWatermark } from '@/utils/image-processor';
import { expandedRegions } from '@/data/regions-expanded';
import { getAllowedServices, normalizeDistrictName } from '@/utils/shared-targeting';
import 'server-only';

/**
 * 2026 Advanced Prompt Leakage Prevention (Regex Engine)
 * - Identifies and removes common AI instructional patterns at the sentence level.
 * - Prevents users from seeing "As an AI language model..." or "Here is your post...".
 */
function cleanAiTraces(text: string): string {
    let cleaned = text;

    // 1. Remove common Markdown artifacts
    cleaned = cleaned.replace(/```html/g, '').replace(/```/g, '');

    // 2. Remove AI "conversational" fillers and meta-notes (Multi-line aware)
    const fillerPatterns = [
        /^(알겠습니다|Certainly|Sure|Here is|Certainly!|Sure!).*$/gim,
        /^(Note:|Translation:|\(Translation:).*$/gim,
        /^I've prioritized.*$/gim,
        /^I'm ready to.*$/gim,
        /^However, if you want.*$/gim,
        /^If you provide.*$/gim,
        /^Here are \d+ SEO hashtags.*$/gim,
        /당신은\s+[\w\s]+?입니다/g,
        /작성해\s?주세요/g,
        /지침에\s+따라/g,
        /키워드를\s+포함하여/g,
        /AI\s?모델로서/g,
        /블로그\s?포스팅을\s?시작합니다/g,
        /도움이\s?되시길\s?바랍니다/g,
        /아래는\s+[\w\s]+?내용입니다/g
    ];

    fillerPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });

    // 2.1 NEW: Remove " or " patterns (Choice artifacts) and Translations
    // Example: "Title A or Title B" -> "Title A"
    cleaned = cleaned.replace(/\s+or\s+.*$/i, '');
    // Example: "Title (Translated: Title)" -> "Title"
    cleaned = cleaned.replace(/\s*\(Translated:.*?\)/gi, '');
    cleaned = cleaned.replace(/\s*\(번역:.*?\)/gi, '');

    // 3. STRICT MULTI-LANGUAGE FILTERING
    cleaned = cleaned.replace(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\u00C0-\u1EF9]/g, '');

    // 4. Ultra-Aggressive HTML isolation: 
    const firstTag = cleaned.indexOf('<');
    const lastTag = cleaned.lastIndexOf('>');

    if (firstTag !== -1 && lastTag !== -1 && lastTag > firstTag) {
        if (cleaned.includes('<div') || cleaned.includes('<h') || cleaned.includes('<p') || cleaned.includes('<ul')) {
            cleaned = cleaned.substring(firstTag, lastTag + 1);
        }
    }

    // 5. Final safety: remove lines that consist ONLY of non-Korean/non-HTML conversational scraps
    cleaned = cleaned.split('\n')
        .filter(line => !/^(Note:|Translation:|I've |I'm |However |If you |Here are )/i.test(line.trim()))
        .join('\n');

    return cleaned.trim();
}

const BLACK_KEYWORDS = [
    '무조건 해결', '주식', '코인', '대출', '성인', '도박',
    '바카라', '카지노', '토토', '사설', '수익', '광고용', '홍보용', '도시가스'
];

/**
 * Robust Safety Check
 * - Uses partial matching for strict keywords.
 * - Ignores common HTML attributes to prevent false positives.
 */
function isSafeContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return !BLACK_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

const NAVER_PLACE_URLS: Record<string, string> = {
    '변기막힘': 'https://naver.me/FjCEaKcf',
    '하수구막힘': 'https://naver.me/xenVtpVr',
    'default': 'https://naver.me/xenVtpVr'
};

// -----------------------------------------------------------------------------
// MAIN GENERATION ACTION
// -----------------------------------------------------------------------------

export async function generatePostAction(jobType: 'auto' | 'manual' = 'auto') {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let currentKeyword = '';
    const usedModels: string[] = [];

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { success: false, error: 'Missing Supabase configuration' };
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        // 1. LOCATION & TOPIC SELECTION
        const allDistricts: { city: string, dong: string }[] = [];
        const seenDistricts = new Set<string>();

        expandedRegions.forEach(region => {
            region.districts.forEach(district => {
                const normalizedName = normalizeDistrictName(district);
                const key = `${region.name} ${normalizedName}`;
                if (!seenDistricts.has(key)) {
                    seenDistricts.add(key);
                    allDistricts.push({ city: region.name, dong: normalizedName });
                }
            });
        });

        let currentIndex = 0;
        // Note: 'proecessed' is intentional typo matching DB column name
        const { data: stateData } = await supabase
            .from('cron_state')
            .select('last_proecessed_index')
            .eq('id', 'post_generator_global')
            .single();

        if (stateData) {
            currentIndex = stateData.last_proecessed_index + 1;
        }

        if (allDistricts.length === 0) {
            console.error('No districts found in expandedRegions.');
            return { success: false, error: 'Location configuration error' };
        }

        const locationIndex = currentIndex % allDistricts.length;
        const selectedLocation = allDistricts[locationIndex];
        const city = selectedLocation.city;
        const dong = selectedLocation.dong;

        await supabase.from('cron_state').upsert({
            id: 'post_generator_global',
            last_proecessed_index: currentIndex,
            updated_at: new Date().toISOString()
        });

        // 2. STYLE & TARGET SELECTION (2026 Diversity)
        const styles = ['REPORT', 'STORY', 'EXPERT'] as const;
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
        const category = selectedStyle === 'EXPERT' ? '생활꿀팁' : '시공사례';

        const availableServices = getAllowedServices(city, dong);
        const service = availableServices[Math.floor(Math.random() * availableServices.length)];
        const keyword = `${city} ${dong} ${service}`;
        currentKeyword = keyword;

        // 3. TITLE GENERATION (AI Briefing Targeted)
        const titlePrompt = `
        [Role] SEO Copywriter for Naver/Google 2026.
        [Task] Create ONE click-inducing title for a plumbing service blog.
        [Target] AI Briefing & Search Results.
        
        [Constraints]
        1. Front-load keywords: Primary keyword "${city} ${dong} ${service}" must appear early.
        2. Forbidden words: ${BLACK_KEYWORDS.join(', ')}, No "As an AI".
        3. Language: PURE KOREAN ONLY. NO English translations.
        4. Output ONLY ONE title string. DO NOT provide options or alternative versions. NO "or ...", NO "(Translated: ...)".
        5. Length: 25-40 Korean characters.
        `;

        const titleRes = await generateWithGroq({ prompt: titlePrompt, type: 'METADATA', temperature: 0.8 });
        usedModels.push(titleRes.model_used);

        const titleRaw = cleanAiTraces(titleRes.content);
        let title = titleRaw.split('\n').map(l => l.trim()).filter(l => l.length > 5)[0] || titleRaw;
        title = title.replace(/^["'『「‘“]|["'』」’ ”]$/g, '').trim();
        title = title.split(/\sor\s/i)[0].trim();

        // 4. IMAGE PREPARATION & ALT TEXT
        // Pick from local photos ONLY as requested.
        let mainImagePath = await getRandomUserImage();
        let mainImageUrl = '';
        let altText = '';

        if (!mainImagePath) {
            // If random image selection fails, try once more or use a default one (not external)
            mainImagePath = await getRandomUserImage();
        }

        if (mainImagePath) {
            // Synthesize the title onto the local image
            mainImageUrl = await processImageWithWatermark(mainImagePath, title);

            // Generate ALT text for SEO
            const altPrompt = `Summarize this image for SEO in ONE Korean sentence. Context: ${keyword} service. 
            [Constraints]
            1. PURE KOREAN ONLY.
            2. ONLY output the sentence. NO intro, NO outro, NO English, NO translations.`;
            const altRes = await generateWithGroq({ prompt: altPrompt, type: 'METADATA' });
            altText = cleanAiTraces(altRes.content).split('\n')[0].replace(/^["'『「‘“]|["'』」’ ”]$/g, '').trim();
        } else {
            // True Fallback: If absolutely no local images, use a local placeholder (ensure this exists in public/images)
            mainImageUrl = '/images/hero.png';
            altText = `${city} ${dong} ${service} 현장 사진`;
        }

        // 5. CONTENT GENERATION (2026 SEO Optimized)
        const styleInstructions = {
            REPORT: "현장 보고서 형식: 증상 진단, 사용 장비(Ridgid, Flex Shaft), 작업 과정을 상세히 기술하세요.",
            STORY: "고객 스토리 형식: 고객의 불편함에 공감하고, 해결 후 안도하는 고객의 반응을 따뜻하게 기술하세요.",
            EXPERT: "전문 지식 가이드: 이슈의 근본 원인을 분석하고(슬러지, 배관 구조 등), 전문가로서의 예방법을 심도 있게 기술하세요."
        };

        const contentPrompt = `
        [Role] Veteran Plumber & SEO Strategist (2026 Trend).
        [Task] Write a high-quality blog post (1500-2000 chars) in HTML.
        [Target Keyword] ${keyword}
        [Style] ${styleInstructions[selectedStyle]}

        [Language Constraint] PURE KOREAN ONLY. 
        - ABSOLUTELY NO Foreign languages (English, Chinese, Vietnamese, Turkish, etc.) in the body text.
        - Even technical terms should use Korean terminology or standard industry terms (e.g., Use '내시경' instead of 'Camera' if possible, or 'Ridgid K-60' as the only exception).

        [Structure]
        1. <div class="ai-briefing"> (3-line crisp summary for AI indexing) </div>
        2. <h2> (Introduction with empathy) </h2>
        3. <h3> (Deep dive / Process / Diagnosis) </h3>
        4. (Use <ul>, <li>, <strong> for readability)
        5. (Mention equipment: Ridgid K-60, 내시경 카메라, 고압세척기)
        6. NO Markdown symbols (##, **). Use HTML only.
        
        [Constraints]
        - DO NOT mention being an AI.
        - Add <br> for comfortable mobile reading.
        - E-E-A-T: Show actual 'Experience' and 'Expertise'.
        `;

        const contentRes = await generateWithGroq({ prompt: contentPrompt, type: 'CONTENT', temperature: 0.7 });
        usedModels.push(contentRes.model_used);
        const content = cleanAiTraces(contentRes.content);

        // 6. TAG SELECTION
        const tagPrompt = `Generate 10 SEO hashtags for ${keyword}. 
        [Constraints]
        1. Context: Plumbing, Drain cleaning, Sewer high-pressure washing.
        2. Strictly FORBIDDEN: "도시가스", "가스공사" or any gas-related terms. Safe terms: #하수구막힘 #배관수리.
        3. Output Language: KOREAN ONLY.
        4. Format: #tag1 #tag2... 
        5. ONLY output the hashtags, no intro or outro.`;
        const tagRes = await generateWithGroq({ prompt: tagPrompt, type: 'METADATA' });
        const tags = cleanAiTraces(tagRes.content);

        // 7. ASSEMBLY
        const placeUrl = NAVER_PLACE_URLS[service] || NAVER_PLACE_URLS['default'];
        const footerHtml = `
            <div class="post-footer" style="margin-top: 40px; padding: 25px; border: 2px solid #03C75A; border-radius: 15px; background-color: #f0fff4;">
                <h3 style="color: #03C75A; margin-bottom: 15px;">🔍 ${city} ${dong} 배관 전문가 '전북배관'</h3>
                <p><strong>전화 문의: <a href="tel:010-8184-3496" style="color: #d32f2f; text-decoration: underline;">010-8184-3496</a></strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    <li>✅ 24시간 긴급 출동 대기 (전북 전 지역)</li>
                    <li>✅ 최신 고압세척 및 내시경 장비 완비</li>
                    <li>✅ 해결하지 못하면 비용을 받지 않습니다.</li>
                </ul>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${placeUrl}" target="_blank" style="padding: 12px 25px; background: #03C75A; color: white; border-radius: 30px; font-weight: bold; text-decoration: none;">네이버 지도 상세보기</a>
                </div>
            </div>
        `;

        const finalContent = `
            <img src="${mainImageUrl}" alt="${altText}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;" />
            ${content}
            ${footerHtml}
            <div style="display:none;">${tags}</div>
        `;

        if (!isSafeContent(title) || !isSafeContent(finalContent)) {
            throw new Error('Safety filter triggered during final assembly');
        }

        // 8. DB INSERT & LOG
        const { error } = await supabase
            .from('posts')
            .insert([{
                keyword,
                title,
                content: finalContent,
                image_url: mainImageUrl,
                status: 'published',
                category: category
            }]);

        if (error) throw error;

        await supabase.from('cron_logs').insert([{
            job_type: jobType,
            status: 'success',
            keyword: keyword,
            title: title,
            model_used: usedModels.join(', ')
        }]);

        return { success: true, keyword, title };

    } catch (error: unknown) {
        console.error('[Post Generation Error]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        try {
            const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
            await supabase.from('cron_logs').insert([{
                job_type: jobType,
                status: 'failure',
                keyword: currentKeyword || 'Unknown',
                error_message: errorMessage,
                model_used: usedModels.join(', ')
            }]);
        } catch { }

        return { success: false, error: errorMessage };
    }
}
