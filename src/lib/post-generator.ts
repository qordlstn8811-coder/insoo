import { createClient } from '@supabase/supabase-js';

// Client initialization moved inside function to avoid build-time errors
// const supabase = createClient(...)


// Interface for Gemini API Response
interface GeminiCandidate {
    content: {
        parts: { text: string }[];
    };
}

interface GeminiResponse {
    candidates?: GeminiCandidate[];
}

/**
 * Strips likely Korean phone numbers from text for safety.
 */
function stripPhoneNumbers(text: string): string {
    return text.replace(/\d{2,3}-\d{3,4}-\d{4}/g, '[전화번호 비공개]')
        .replace(/\d{10,11}/g, '[전화번호 비공개]');
}

/**
 * Generates an HTML Graphic Card with a random vibrant gradient and centered text.
 * Enhanced with more diverse colors and patterns.
 */
function generateGraphicCardHtml(text: string, seed: number): string {
    // [Modified] User Request: "Never overlap" - Use dynamic HSL generation for infinite variety
    // Generate a random base hue based on seed + randomness
    const baseHue = (seed * 137 + Math.floor(Math.random() * 360)) % 360;
    const complHue = (baseHue + 45 + Math.floor(Math.random() * 90)) % 360;

    // Generate vibrant but readable colors (Saturation 60-80%, Lightness 55-65%)
    const sat = 60 + Math.floor(Math.random() * 20);
    const light = 55 + Math.floor(Math.random() * 10);

    const gradient = `linear-gradient(135deg, hsl(${baseHue}, ${sat}%, ${light}%) 0%, hsl(${complHue}, ${sat}%, ${light + 10}%) 100%)`;

    return `
    <div style="
        width: 100%;
        aspect-ratio: 16/9; /* Optimized for blog view */
        background: ${gradient};
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        box-sizing: border-box;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        margin: 30px 0;
        overflow: hidden;
        position: relative;
    ">
        <!-- Decorative Circle 1 -->
        <div style="
            position: absolute;
            top: -50px;
            right: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        "></div>
        
        <!-- Decorative Circle 2 -->
        <div style="
            position: absolute;
            bottom: -30px;
            left: -30px;
            width: 150px;
            height: 150px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
        "></div>

        <div style="
            background: rgba(255, 255, 255, 0.95);
            width: 100%;
            height: 100%;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        ">
            <h2 style="
                color: #2c3e50;
                font-size: clamp(22px, 5vw, 38px);
                font-weight: 800;
                line-height: 1.4;
                word-break: keep-all;
                margin: 0;
                letter-spacing: -0.5px;
            ">
                ${text}
            </h2>
            <div style="
                width: 40px; 
                height: 4px; 
                background: ${gradient}; 
                margin-top: 15px; 
                border-radius: 2px;
            "></div>
        </div>
    </div>
    `;
}

/**
 * Generates an HTML Image with a stylish text overlay.
 */
function generateOverlayImageHtml(imageUrl: string, altText: string, overlayText: string): string {
    return `
    <div style="
        position: relative; 
        margin: 30px 0; 
        border-radius: 15px; 
        overflow: hidden; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    ">
        <img src="${imageUrl}" alt="${altText}" style="
            width: 100%; 
            height: auto; 
            display: block; 
            object-fit: cover;
        " onerror="this.style.display='none'" />
        
        <div style="
            position: absolute; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%); 
            padding: 40px 20px 20px; 
            text-align: center;
        ">
            <p style="
                color: #fff; 
                font-size: clamp(18px, 4vw, 24px); 
                font-weight: 800; 
                margin: 0; 
                text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
                word-break: keep-all;
                line-height: 1.3;
            ">
                ${overlayText}
            </p>
        </div>
    </div>
    `;
}

const LOCATIONS = [
    '전주시', '전주', '완산구', '덕진구',
    '군산시', '군산', '익산시', '익산',
    '정읍시', '정읍', '남원시', '남원',
    '김제시', '김제', '완주군', '완주',
    '진안군', '진안', '무주군', '무주',
    '장수군', '장수', '임실군', '임실',
    '순창군', '순창', '고창군', '고창',
    '부안군', '부안',
    '전북 전 지역', '전라북도'
];

const SERVICES = ['변기막힘', '하수구막힘', '싱크대막힘', '수도설비', '배관청소', '누수탐지'];
const NAVER_PLACE_URLS: Record<string, string> = {
    '변기막힘': 'https://naver.me/FjCEaKcf',
    '하수구막힘': 'https://naver.me/xenVtpVr',
    'default': 'https://naver.me/xenVtpVr'
};

const ARTICLE_TEMPLATES = [
    'case_study', 'how_to_guide', 'prevention_tips', 'emergency_response', 'comparison',
];

const TARGET_AUDIENCES = [
    // --- 가정 및 주거 (Residential) ---
    '화장실을 급하게 써야 하는 다급한 주부',
    '퇴근 후 배수구 냄새 때문에 스트레스 받는 30대 직장인',
    '세입자 민원을 해결해야 하는 원룸 건물주',
    '갑자기 물이 안 내려가 당황한 신혼부부',
    '어린 자녀가 장난감을 변기에 빠뜨려 멘붕 온 초보 엄마',
    '어르신 혼자 계신 집에 배관 문제가 생겨 걱정인 자녀',
    '오래된 아파트에 새로 이사 와서 배관 상태가 불안한 사회초년생',
    '맞벌이로 바빠 야간이나 주말에만 시공이 가능한 직장인 부부',
    '인테리어 공사 후 배수구에 시멘트가 들어가 고생 중인 집주인',
    '거동이 불편해 직접 확인이 어려워 전문가가 절실한 독거 어르신',
    '층간 누수로 아랫집과 분쟁 중인 예민한 아파트 거주자',
    '반려동물 목욕 후 털 뭉치로 하수구가 막힌 1인 가구',
    '해외 여행 가기 직전 누수를 발견하고 발을 동동 구르는 여행객',
    '명절에 온 가족이 모였는데 변기가 막혀버린 대가족',
    '베란다 세탁기 역류로 물바다가 된 주말 대청소 중인 주부',
    '부모님 댁 주방 싱크대 악취를 해결해드리고 싶은 효녀/효자',
    '이사 당일 변기 막힘을 발견해 짐도 못 풀고 있는 이사객',
    '욕실 리모델링 후 배수가 느려져 하자 보수를 고민 중인 분',
    '수도세가 너무 많이 나와 숨은 누수를 찾고 싶은 알뜰한 주부',
    '변기에 물티슈를 버려 메인 배관이 막힌 줄 모르고 당황한 학생',
    '홈파티 준비 중에 주방 싱크대가 막혀 멘붕 온 요리 초보자',
    '새벽에 화장실 물 소리가 계속 들려 잠을 설치는 예민한 분',
    '낡은 빌라로 이사 와서 녹물과 수압이 걱정인 사회초년생',
    '아이들이 실수로 면도기를 변기에 넣어버려 난감한 아빠',
    '장기간 집을 비웠다가 돌아왔을 때 하수구 악취가 진동하는 분',

    // --- 상업 및 전문 시설 (Commercial & Professional) ---
    '점심 장사를 망칠까 봐 걱정하는 식당 사장님',
    '아이들이 물을 잘 내려서 걱정인 학원 원장님',
    '고객 응대 중 화장실 막힘으로 당황한 카페 매니저',
    '영업 마감 직전 배수구가 막힌 24시 편의점 근무자',
    '샴푸대 배수구가 막혀 손님을 못 받고 있는 미용실 원장님',
    '샤워실 물이 안 빠져 회원들 불만이 폭주하는 헬스장 관장님',
    '탕비실 싱크대 역류로 업무에 차질이 생긴 사무실 관리자',
    '밤샘 영업 중 변기가 막혀 곤란한 PC방 아르바이트생',
    '어린이집 화장실이 막혀 아이들 위생이 걱정인 원장님',
    '병원 화장실 막힘으로 환자들의 불편을 해결해야 하는 행정실장',
    '고급 레스토랑 주방 배수구에서 올라오는 악취가 걱정인 쉐프',
    '세입자 민원을 대신 해결해야 하는 부동산 중개인/관리인',
    '건물 전체 배관 관리가 필요한 상가 번영회장',
    '위생 점검을 앞두고 하수구 청소가 시급한 대형 마트 관리자',
    '치과 석션 배관이 막혀 진료에 차질이 생긴 간호사',
    '고깃집 주방의 기름 슬러지 역류로 발을 동동 구르는 사장님',
    '제과점 바닥 배수구 막힘으로 밀가루 반죽이 역류한 파티시에',
    '사우나 배수관 스케일 제거가 필요한 시설 유지보수 팀장',
    '급식실 주방 그리스트랩 막힘으로 조리가 중단된 영양사',
    '모텔 객실 간 누수 분쟁을 원만히 해결하고 싶은 업주',
    '자동차 공업사 바닥 배수구에 기름때가 가득 차 고민인 대표님',
    '요양원 공용 화장실 막힘으로 어르신 케어에 비상이 걸린 요양보호사',
    '스크린 골프장 화장실 악취로 손님들의 항의를 받는 매니저',
    '신축 빌라 분양 전 배관 상태를 최종 점검하고 싶은 시행사 대표',
    '지하 주차장 집수정 펌프 고장으로 침수가 우려되는 관리소장',

    // --- 상황별 페르소나 (Situational Contexts) ---
    '새벽에 갑자기 변기가 역류해 어쩔 줄 모르는 분',
    '주말 저녁이라 관리사무소 직원도 없어 막막한 분',
    '타 업체에서 못 뚫는다고 포기하고 가서 절망적인 분',
    '셀프로 뚫어보려다 장비가 박혀버려 상황이 악화된 분',
    '장마철 하수구 역류로 집안에 물이 들어오는 긴박한 분',
    '수도 계량기가 터져 물난리가 난 한파 속 거주자',
    '이사 전 배관 스케일링으로 깨끗하게 관리하고 싶은 꼼꼼한 분',
    '빌딩 고층에서 물이 안 내려가 아래층 누수가 걱정인 분',
    '음식물 처리기 고장으로 싱크대가 꽉 막힌 주부',
    '정화조가 넘친 줄 알았는데 배관 무너짐을 발견한 건물주',
    '배관 내시경으로 정확한 원인을 보고 싶어 하는 분석적인 분',
    '고압 세척으로 배관을 새것처럼 만들고 싶은 상가 소유주',
    '친척들이 모인 잔칫날에 하필 하수구가 터진 집',
    '세입자가 나간 후 엉망이 된 배관을 보며 분노한 임대인',
    '오래된 배관 교체 공사 비용이 걱정되어 견적을 비교 중인 분',
    '누수 보험 처리가 가능한지 전문가의 조언이 필요한 분',
    '상수도에서 녹물이 나와 필터를 끼워도 해결이 안 되는 분',
    '주방 하부장에서 물이 샌 지 오래되어 곰팡이가 핀 집',
    '화장실 바닥에서 꼬르륵 소리가 계속 나 불안한 거주자',
    '비만 오면 하수구에서 꾸정물이 역류하는 저층 거주자',
    '변기에 칫솔이나 면도기를 빠뜨리고 물을 내린 당혹스러운 상황의 분',
    '수돗물이 갑자기 안 나와서 배관 결빙을 의심하는 한파 속 시민',
    '세면대 아래 트랩이 삭아서 툭 떨어진 상태로 방치 중인 분',
    '오래된 정화조 냄새가 매장 안까지 들어와 장사에 차질 있는 사장님',
    '누구보다 빠르고 확실한 출동을 원하는 성격 급한 한국인',

    // --- 추가 확장 (Extended Lists) ---
    '전원주택 지하수 펌프 문제로 물이 끊긴 거주자',
    '농막 싱크대 동파로 배관 수리가 시급한 분',
    '캠핑장 공용 개수대 막힘을 해결해야 하는 캠지기',
    '학원가 빌딩 화장실 막힘으로 학생들 민원이 폭주하는 관리인',
    '전통 시장 공용 배수관 고압 세척이 필요한 번영회 임원',
    '빨래방 대형 세탁기 배수관 막힘으로 가동이 중단된 점주',
    '수영장 탈의실 샤워장 배수 불량으로 고생 중인 시설팀',
    '애견 카페 화장실이 개털 뭉치로 막힌 사장님',
    '만화 카페 굴방 밑 누수가 발견되어 당황한 사장님',
    '코인 노래방 변기 내 껌/사탕/담배꽁초 막힘으로 골머리 썩는 업주',
    '스터디 카페 커피 머신 배수관이 막혀 곤란한 관리자',
    '공장 구내식당 대형 하수관 청소가 필요한 영양사',
    '어린이 과학관 수전 누수로 전시물 오염이 걱정인 학예사',
    '화단 우수관이 흙으로 가려져 물이 안 빠지는 집주인',
    '옥상 빗물 배관 막힘으로 1층 현관에 물이 새는 건물 거주자',
    '교회 식당 및 화장실 대량 배수 관리가 필요한 관리 집사',
    '창고 천장에서 정체불명의 물방울이 떨어져 조마조마한 물류 팀장',
    '수족관 수조 배수 밸브 고장으로 물이 안 빠지는 업주',
    '치료 센터 특수 샤워 시설 배관 관리가 필요한 센터장',
    '작업실 싱크대 페인트 잔여물로 막힌 예술가',
    '도시락 전문점 대형 배수구 막힘으로 주문이 밀린 조리장',
    '푸드트럭 간이 배수 탱크 역류로 영업 중단된 사장님',
    '골프 연습장 샤워실 배관 스케일 제거가 시급한 책임자',
    '장례식장 조리실 하수구 막힘으로 긴급 지원이 필요한 관리자',
    '고궁/사찰 내 노후 화장실 배관 수리가 조심스러운 관계자'
];

const CONTEXTS = [
    // --- 긴급 상황 (Emergency) ---
    '갑자기 날씨가 추워지면서 배관이 얼었을 가능성',
    '장마철 습기 때문에 악취가 더 심해지고 물이 역류하는 상황',
    '주말이라 관리사무소 연락이 어려운 상황',
    '손님이 오기로 했는데 갑자기 막힌 난감한 상황',
    '셀프로 뚫어보려다 옷걸키가 박혀버려 오히려 더 꽉 막혀버린 상황',
    '늦은 밤 윗층에서 물이 새어 내려와 천장이 젖고 있는 상황',
    '싱크대 아래 호스가 빠져 주방 바닥이 물바다가 된 상황',
    '변기에 물티슈를 계속 버려서 메인 배관까지 꽉 막힌 상황',
    '원인을 알 수 없는 배수구 구정물 역류로 악취가 진동하는 상황',
    '오픈을 1시간 앞둔 식당 주방 배수구에서 구정물이 역류하는 긴급 상황',
    '영하 15도 한파에 아파트 복도 계량기가 터져 물난리가 난 상황',
    '베란다 우수관에서 거품이 역류해 거실까지 물이 들어오기 직전인 상황',
    '변기 물이 역류해 화장실 바닥이 오물로 가득 차기 직전인 상황',
    '수돗물이 갑자기 안 나와서 배관 결빙을 의심하는 한파 속 상황',
    '새벽에 배수구에서 꿀렁거리는 괴음과 함께 물이 넘치는 상황',

    // --- 고착 및 노후화 (Build-up & Aging) ---
    '음식물 처리기 사용 후 기름 찌꺼기가 굳어 배관을 완전히 막은 상황',
    '정기 관리를 안 해서 배관 내부에 기름 석순이 가득 차 물길이 막힌 상황',
    '오래된 빌라의 공용 배관이 막혀 전 세대가 화장실을 못 쓰는 상황',
    '배수구 석회/기름 슬러지 형성으로 인해 배수 속도가 현저히 느려진 상황',
    '노후 오폐수관 균열로 인해 흙이 유입되어 배관이 막힌 상황',
    '미세한 누수로 인해 벽지와 마루가 썩어가고 있는 노후 주택 상황',
    '싱크대 아래가 늘 축축하고 곰팡이 냄새가 진동하지만 원인을 모르는 상황',
    '수도 계량기 별표는 안 도는데 벽이 젖어 외벽 누수가 의심되는 상황',
    '변기 뒤쪽 결로로 착각했으나 알고 보니 미세한 크랙으로 누수 중인 상황',
    '배관 라이닝 공사 대신 긴급 보수가 필요한 파손된 하수관 상황',

    // --- 이물질 유입 (Foreign Materials) ---
    '변기 안으로 칫솔이나 면도기가 들어가서 물을 내릴 때마다 불안한 상황',
    '어린 아이가 변기에 장난감을 넣고 물을 내려버려 꽉 막힌 상황',
    '화장실 공사 중 시멘트나 타일 조각이 하수구로 들어가 굳어버린 상황',
    '화단 우수관이 흙과 낙엽으로 가려져 비만 오면 물이 안 빠지는 상황',
    '미용실 샴푸대 하수구가 머리카락 대량 유입으로 인해 마비된 상황',
    '카페 싱크대가 커피 찌꺼기 슬러지로 인해 배수가 중단된 상황',
    '고깃집 주방 배수구가 동물성 기름 응고로 인해 꽉 막힌 상황',
    '변기에 대량의 물티슈를 버려 메인 정화조 입구까지 막혀버린 상황',
    '싱크대 거름망이 빠진 채 설거지를 하다가 숟가락이 빨려 들어간 상황',
    '반려동물 목욕 후 대량의 털이 배수구 트랩을 완전히 덮어버린 상황',

    // --- 수리 실패 및 분쟁 (Failed Fixes & Disputes) ---
    '셀프로 뚫어보려다 스프링 장비가 배관 안에서 끊어져버린 난감한 상황',
    '타 업체에서 못 뚫는다고 포기하고 돌아가서 절망적인 상황',
    '동네 전단지 업체가 해결은 못하고 출장비만 과다 청구해 화가 난 상황',
    '싱크대 악취 해결을 위해 트랩을 직접 달았으나 오히려 역류하는 상황',
    '아파트 층간 누수 책임 소재로 윗집과 소통이 안 되어 답답한 상황',
    '이사 전 배관 청소를 미리 해두고 싶은데 업체를 고민 중인 상황',
    '수도 요금이 평소보다 5배나 많이 나와 누수 탐지가 시급한 상황',
    '누수 보험 처리를 위해 전문 소견서와 사진 증거가 필요한 상황',
    '배수구 뚫는 약품을 한 통 다 부어도 전혀 효과가 없어 지친 상황',
    '밤늦게 아래층에서 물이 샌다고 올라와서 당황하며 원인을 찾는 상황',

    // --- 추가 특이 상황 (Special Scenarios) ---
    '이사 당일 변기 막힘을 발견하고 짐도 못 풀고 멘붕에 빠진 상황',
    '중요한 손님 초대를 1시간 앞두고 주방 싱크대가 역류한 상황',
    '병원 화장실 막힘으로 인해 환자들의 민원을 긴급 처리해야 하는 상황',
    '학교 급식실 조리 도중 하수구가 막혀 급식 준비에 비상이 걸린 상황',
    '공장 배수 설비 고장으로 생산 라인이 멈출 위기에 처한 상황',
    '수영장 탈의실 샤워장이 배수 불량으로 물바다가 되어 폐쇄 위기인 상황',
    '지하 자취방 하수구가 비만 오면 꾸정물로 역류해 잠을 못 자는 상황',
    '새벽에 수도관 소음(워터해머)이 너무 심해 이웃 눈치가 보이는 상황',
    '정화조가 가득 찬 줄 알았는데 알고 보니 뿌리 침투로 배관이 터진 상황',
    '인테리어 업체에서 배관을 건드려 미세 누수가 발생한 억울한 상황',
    '고압 세척을 받아보고 싶은데 비용 대비 효과를 확신하지 못하는 상황',
    '변기 수조 내부 부품이 낡아 물 내림 레버가 헛도는 당황스러운 상황',
    '세면대 폽업이 쏙 들어가서 안 나와 물을 못 빼고 있는 상황',
    '에어컨 배수 호스가 막혀 거실 벽지가 다 젖고 있는 상황',
    '베란다 우수관에 고드름이 생겨 물이 안 내려가고 얼어붙은 상황',
    '욕실 슬라이더 문 하단 배수 구멍이 막혀 거실로 물이 넘치는 상황',
    '카페 제빙기 배수 호스에서 물이 새 바닥이 미끄러운 위험한 상황',
    '전원주택 지하수 모터는 도는데 물이 안 나와 배관을 점검해야 하는 상황',
    '누수 범위를 못 찾아 방바닥을 여기저기 깼지만 허탕 치고 있는 상황',
    '오래된 정화조 뚜껑 주변이 삭아서 악취가 매장으로 유입되는 상황',
    '변기에 물티슈 대신 사용할 키친타월을 버렸다가 꽉 막힌 상황',
    '집안 모든 수전의 수압이 동시에 약해져 메인 밸브를 의심하는 상황',
    '옥상 빗물받이에 이물질이 끼어 폭우 시 물이 벽을 타고 흐르는 상황',
    '치과 교정용 이물질이 배관에 걸려 석션기가 자꾸 멈추는 상황',
    '전문가 방문 전 우리가 미리 준비해두면 좋은 것들을 고민하는 상황'
];

const INFO_TOPICS = [
    // --- 화장실 & 변기 관련 (Bathroom & Toilet) ---
    '변기 막혔을 때 뚫는 확실한 방법 (페트병, 비닐)',
    '욕실 하수구 냄새 제거하는 초간단 꿀팁',
    '세면대 물이 잘 안 내려갈 때 1분 해결법',
    '변기 물소리가 계속 날 때 확인해야 할 부속품',
    '화장실 바닥 타일 곰팡이 완벽 제거 청소법',
    '변기에 빠진 칫솔/장난감 안전하게 꺼내기',
    '비데 노즐 청소 및 살균 관리 요령',
    '욕실 환풍기 담배 냄새 역류 차단하는 방법',
    '변기 세정제 사용의 장점과 배관에 미치는 영향',
    '세면대 수전 누수 시 셀프 교체 가이드',
    '화장실 하수구 벌레(나방파리) 퇴치법',
    '변기 수조 물 용량 조절로 수도 요금 아끼는 법',
    '욕조 배수구막힘 머리카락 제거 꿀팁',
    '화장실 줄눈 셀프 시공 시 주의사항',
    '변기 흔들림 방지를 위한 백시멘트 보수 작업',
    '욕실 젠다이/코너 선반 물때 제거법',
    '공공장소 화장실 변기 시트 소독의 중요성',
    '변기 내부 누수 여부 염료 테스트법',
    '포세린 타일 욕실 청소 시 주의할 세제 종류',

    // --- 주방 관련 (Kitchen) ---
    '싱크대 배수구 막힘 예방하는 올바른 습관',
    '주방 싱크대 악취 원인과 확실한 제거법',
    '고기 기름 싱크대에 그냥 버리면 안 되는 이유',
    '싱크대 배수통 및 호스 교체 주기와 방법',
    '음식물 처리기(디스포저) 올바른 사용과 관리',
    '베이킹소다와 식초로 싱크대 배관 살균하기',
    '싱크대 수전 헤드 물때 제거 및 소독법',
    '싱크대 아래 음식물 냄새가 올라올 때 대처법',
    '배수구 거름망 선택 시 고려해야 할 점',
    '싱크대 하부장 호스 누수 초간단 확인법',
    '주방 배수구에 뜨거운 물을 주기적으로 부어야 하는 이유',
    '식기세척기 배수관 관리법과 막힘 예방',
    '주방 후드 기름때 제거가 배수구에 미치는 영향',

    // --- 겨울철 & 계절 관리 (Seasonal) ---
    '겨울철 수도계량기 동파 방지 및 대처법',
    '보일러 배관 청소 주기와 난방비 절약 효과',
    '수도가 얼었을 때 드라이기로 녹여도 될까?',
    '한파 대비 수도 꼭지 조금 틀어두기의 효과',
    '장마철 하수구 역류 원인과 사전 대비책',
    '여름철 높은 습도로 인한 하수구 악취 관리',
    '여름 휴가 떠나기 전 배관 내부 확인하기',
    '수도 계량기 함 옷가지로 감쌀 때 주의점',
    '외부 수도꼭지 동파 방지 커버 설치법',
    '베란다 우수관 겨울철 결빙 사고 방지법',

    // --- 누수 & 배관 설비 (Leaks & Maintenance) ---
    '갑자기 수도세가 많이 나올 때 누수 확인법',
    '우리 집 미세 누수가 아랫집 천장에 주는 피해',
    '누수 탐지 정밀 장비의 종류와 작동 원리',
    '배관 내시경 검사가 필요한 결정적인 상황',
    '고압 세척과 스프링 작업의 차이점 이해하기',
    '노후 배관 교체 지원 제도 활용하는 법',
    '상수도 누수와 하수도 누수 구별하는 방법',
    '아파트 층간 누수 발생 시 책임 소재 규정',
    '수도 계량기 별표가 돌아가면 누수인가요?',
    '배관 보온재 설치로 에너지 효율 높이기',

    // --- 일반 생활 꿀팁 & 상식 (General Tips) ---
    '물티슈를 변기에 버리면 안 되는 공학적 이유',
    '친환경 세제로 배관 부식 방지하며 청소하기',
    '집안 모든 배수구에 트랩 설치 시 장단점',
    '배관 청소 약품(트래펑 등)의 올바른 사용법',
    '오래된 빌라로 이사 갈 때 배관 체크리스트',
    '수압이 갑자기 약해졌을 때 체크해야 할 것',
    '배수구 석회/기름 슬러지 형성 과정과 위험성',
    '수전 엘보우 파손 시 긴급 응급 처치법',
    '배관 관리 앱/서비스 활용해 정기점검 받기',
    '배관 수리 업체 선정 시 바가지요금 피하는 법',
    'A/S 보장되는 전문 배관 업체를 찾아야 하는 이유',
    '셀프 배관 청소 도구 구매 가이드 (다이소 vs 전문몰)',
    '수도물에서 녹물이 나올 때 필터 설치 및 해결책',
    '옥상 우수관 관리가 1층 하수구에 미치는 영향',
    '배관 공사 시 소음 분쟁 해결 및 사전 고지 방법',

    // --- 추가 정보성 주제 (Additional Diverse Topics) ---
    '싱크대 물 내릴 때 꾸르륵 소리 원인과 해결책',
    '변기 뒤쪽 물 고임 현상, 결로일까 누수일까?',
    '주방 수전 필터 교체 주기와 수질 관리 팁',
    '하수구 뚫는 약품 사용 시 배관 부식 방지 주의사항',
    '욕실 슬라이딩 도어 하단 배수 관리 소홀 시 문제점',
    '샤워기 호스 꼬임 방지와 올바른 세척법',
    '화장실 냄새 차단 트랩, 자석식 vs 실리콘식 비교',
    '변기 레버가 헛돌 때 1000원으로 고치는 법',
    '아파트 단지 메인 정화조 청소와 개별 세대 배관의 관계',
    '옥상 빗물관 막힘으로 인한 1층 하수구 역류 사례',
    '오래된 주택 상수도관 녹물 배출 시 대처 가이드',
    '배관 내시경으로 찾은 충격적인 이물질 사례들',
    '수도 계량기 유리창 깨졌을 때 교체 비용과 책임',
    '변기 백시멘트 깨짐 방치하면 안 되는 이유',
    '싱크대 거름망 스테인리스 vs 플라스틱 위생 비교',
    '배수구에 계란 껍질이나 커피 찌꺼기를 버리면 안 되는 이유',
    '화장실 바닥 미끄럼 방지 코팅이 배수구에 주는 영향',
    '욕실 천장 점검구 확인으로 누수 여부 판단하기',
    '변기 속 석회 자국 제거하는 가장 효과적인 방법',
    '세탁실 배수구 얼었을 때 뜨거운 물 붓기 vs 스팀 해동',
    '새 아파트 입주 전 배관 사전 점검이 필요한 이유',
    '고압 세척 후 배관 유지보수 기간 늘리는 법',
    '상가 화장실 사탕 봉지/담배꽁초 막힘 해결 사례',
    '주방 배수구 거푸집 주변 누수 확인 및 실리콘 보수',
    '하수구 고압세척 비용, 왜 업체마다 다를까?',
    '전문 배관사의 도구 가방에는 무엇이 들어있을까?',
    '장기 외출 시 수도 밸브 잠그기가 누수 방지에 주는 효과',
    '세면대 팝업 고장 시 부품만 사서 셀프 수리하는 법',
    '수돗물에서 흙냄새나 비린내가 날 때 의심해볼 원인',
    '보일러 분배기 미세 누수를 그냥 지나치면 안 되는 이유',
    '여름철 에어컨 배수 호스 막힘으로 인한 실내 침수 예방',
    '지하 상가 하수구 역류 방지용 체크밸브 설치의 중요성',
    '싱크대 볼 아래쪽 결로 방지 코팅이 벗겨졌을 때',
    '욕실 거울 김서림 방지제가 하수구 오염에 미치는 영향',
    '강아지 목욕 후 털 뭉치로 막힌 하수구 뚫기',
    '셀프 배관 뚫기 실패 후 전문가에게 연락해야 하는 타이밍',
    '배관 공사 후 시공 보증서(A/S 확약)를 반드시 받아야 하는 이유',
    '수도관 동파 방지를 위한 열선 설치 시 주의사항',
    '화장실 청소용 고압 스프레이건 설치가 배관에 주는 영향',
    '변기 솔 청결하게 관리하고 교체하는 시기',
    '욕실 선반 설치를 위한 타일 타공 시 배관 위치 피하는 법',
    '다세대 주택 공용 하수구 비용 분담 관설과 관례',
    '상가 주방 배수트랩(그리스트랩) 정기 청소의 의무와 관리',
    '배관 누수 보험(일상생활 배상책임) 보상 범위 확인하기',
    '수압 상승 샤워기 헤드가 노후 배관에 주는 부담',
    '싱크대 하부 호스 늘어짐 방지를 위한 고정 요령',
    '겨울철 야외 세탁기 사용 시 배수 호스 결빙 방지법',
    '배수구 냄새 제거를 위한 레몬/식초 활용 천연 세제',
    '변기 물 내림 버튼이 뻑뻑할 때 해결하는 법',
    '욕실 리모델링 후 배수 속도가 느려졌을 때 의심 사안',
    '하수구 속 기름 덩어리를 돌처럼 굳게 만드는 주범들',
    '수도관 교체 공사 전 수돗물 미리 받아두는 요령',
    '누수 탐지 비용은 왜 장비 사용료가 포함되나요?',
    '아파트 우수관 소음 해결을 위한 차음재 시공 효과',
    '변기에 물티슈 대신 사용할 수 있는 안전한 대안',
    '싱크대 막힘 해결 후 배관 내시경으로 청결도 확인하기',
    '배수구 트랩 설치 후 배수가 너무 느려졌다면?',
    '전문가가 알려주는 배관 수명 늘리는 가장 쉬운 방법',
    '여름철 계곡/펜션 화장실 이용 시 배관 막힘 주의사항',
    '상가 밀집 지역 하수구 연쇄 막힘의 원인과 공동 대응',
    '싱크대 배수구에 베이킹소다가 효과 없는 경우',
    '수도 계량기 함 습기 제거를 통한 부식 방지법',

    // --- 특수 상업 공간 & 전문 관리 (Specialized Spaces) ---
    '커피 머신 배수 호스 슬러지 막힘 및 예방 관리',
    '치과 병원 석션(흡입) 배관 막힘 원인과 해결책',
    '미용실 샴푸대 하단 거름망 매일 청소해야 하는 이유',
    '애견 미용샵 하수구 털 뭉치 역류 방지 시스템',
    '상가 건물 메인 배관 고압 세척 전 세입자 협조 구하는 법',
    '지하 주차장 집수정 펌프 고장 시 침수 위험성',
    '공장 산업용 배수관 내 고착된 화학 물질 제거 공법',
    '식당 주방 트렌치 배수구 냄새 차단 및 위생 관리',
    '고깃집 배관 내 응고된 동물성 기름 제거 전문 장비',
    '헬스장 운동 시설 내 샤워실 대량 배수 처리 시스템',
    '숙박 시설(모텔/복층) 객실 간 누수 분쟁 해결 원칙',
    '사우나/목욕탕 대형 배관 스케일 제거 주기',
    '학교 급식실 주방 그리스트랩 청소 의무와 벌금',
    '대형 쇼핑몰 공용 화장실 변기 이물질 감지 및 차단 기술',
    '전통 시장 노후 하수구 현대화 사업 신청 및 절차',
    '캠핑장/야외 조리장 겨울철 배수관 물 빼기 작업',
    '코인 빨래방 대형 세탁기 배수 용량 부족 시 증설 방법',
    '수영장 물 여과기 배수관 막힘 시 수질에 미치는 영향',
    '병의원 수술실/실험실 특수 배관 폐수 처리 규정',
    '정육점 바닥 배수구 핏물 및 지방 찌꺼기 관리 요령',
    '빵집 가루 및 유지방으로 인한 배수관 막힘 해결법',
    '카페 주방 바닥 누수가 아래층 매장 영업에 주는 피해',
    '빌딩 옥상 냉각탑 배수관 막힘 시 에어컨 효율 저하',
    '소방용 배관(스프링클러) 미세 누수 발견 및 보수',
    '전원주택 지하수 펌프 고장 시 배관 내 공기 빼는 법',
    '농막/컨테이너 간이 하수도 동파 방지 및 셀프 관리',
    '조립식 욕실(UBR) 누수 시 철거 없이 가용한 보수 공법',
    '배관 보강(라이닝) 공법으로 굴착 없이 하수도 고치기',
    '노후 오폐수관 균열로 인한 토양 오염 및 싱크홀 위험',
    '배관 유량 측정기로 건물 전체 물 사용 패턴 분석하기',

    // --- DIY & 생활 유지 보수 (DIY & Home Care) ---
    '다이소 배수구 세정제 효과 있을까? 전문가의 솔직 리뷰',
    '세면대 폽업 찌든 때, 빨대를 이용해 청소하는 꿀팁',
    '지독한 하수구 냄새, 커피 찌꺼기 뿌리면 더 나빠지는 이유',
    '변기 물탱크 안에 벽돌을 넣었을 때 하수관에 미치는 영향',
    '싱크대 악취의 90%는 이 ‘트랩’ 하나로 해결됩니다',
    '욕실 거울 뒤쪽에 숨은 곰팡이가 배수구 건강에 주는 신호',
    '세탁기 배수 호스 길이를 최소화해야 하는 기술적 이유',
    '베란다 배수구에 락스 대신 과탄산소다를 써야 하는 상황',
    '주방 싱크대 볼 광택 살리면서 배수구까지 살균하는 법',
    '변기 뚜껑 닫고 물 내려야 하는 위생적/배역학적 이유',
    '샤워 헤드 필터 색깔이 하루 만에 변했다면? 배관 오염 진단',
    '겨울철 보일러실 배수구 주변 결빙 방지를 위한 고무 매트 활용',
    '싱크대 하부장에 식초 한 컵 두면 하수구 냄새가 사라질까?',
    '배관 세정제(액체형)를 한 통 다 부어도 안 뚫리는 원인',
    '화장실 바닥 배수구 유가(육가) 구조와 올바른 조립 방법',
    '수도꼭지 물방울 한 방울씩 떨어질 때, 직접 고치는 법',
    '변기 수조 안의 고무 패킹 노화 여부 확인하는 간단 테스트',
    '싱크대 배수구 거름망 사이 끼인 이물질, 칫솔보다 효과적인 도구',
    '하수구 뚫는 전동 스프링 장비, 일반인이 쓰면 위험한 이유',
    '배관 탐지 내시경 없이도 막힌 위치를 추측하는 3가지 방법',
    '배관 막힘 예방을 위해 한 달에 한 번 꼭 해야 하는 관리',
    '옥상 텃밭 흙이 빗물관을 타고 내려와 1층 하수구를 막는 과정',
    '지하 자취방 하수구 역류, 집주인에게 수리 요청하는 법적 근거',
    '변기 교체 비용 아끼려다 배관 규격 안 맞아 낭패 보는 사례',
    '싱크대 아래 악취가 실내 공기질에 미치는 영향 분석',
    '하수구 고압세척 시 발생하는 소음과 진동, 이웃 양해 구하기',
    '전문 업체가 사용하는 배관 세척기 vs 가정용 압축기 성능 비교',
    '여름철 배수구에서 올라오는 정체불명의 소리, 공기압 문제일까?',
    '배관 공사 후 남은 자재와 쓰레기 올바르게 처리하는 법',
    '하수구 뚫기 전문가가 되기 위해 필요한 조건과 기술들',
    '우리 동네 믿을만한 배관 수리 전문점 찾는 검색 팁',

    // --- 건강, 위생 & 환경 (Health & Environment) ---
    '배관 속 바이러스 차단: 하수구 트랩의 방역학적 가치',
    '녹슨 배관에서 나오는 중금속, 우리 가족 건강에 미치는 영향',
    '하수구 냄새와 함께 올라오는 유해가스(황화수소)의 위험성',
    '주방 싱크대 세균 번식 억제하는 친환경 관리 수칙',
    '변기 물 내릴 때 튀는 미세 에어로졸 방지 꿀팁',
    '배수구 곰팡이가 호흡기 질환에 미치는 영향과 대처',
    '상수도관 노후화로 인한 미세 플라스틱 유입과 필터의 역할',
    '정수기 배수 호스 연결 부위 누수와 위생 관리',
    '화장실 바닥 하수구로 버리는 독한 세제가 수질 오염에 주는 영향',
    '배관 관리로 아토피 등 피부 질환 예방하기',
    '새집 증후군만큼 무서운 ‘헌집 하수구 증후군’ 탈출법',

    // --- 테크 & 미래형 관리 (Tech & Smart Home) ---
    '스마트 홈 IoT 누수 감지 센서 설치 및 운영 가이드',
    '원격으로 제어하는 수도 밸브, 장기 외출 시 필수템',
    '배관 내시경 영상 분석 AI가 진단하는 우리 집 배관 수명',
    '첨단 고압 세척 로봇이 하수구를 뚫는 과정',
    '층간 소음 없는 저소음 배관 설계의 원리',
    '에너지 절약형 보일러 배관 순환 펌프 고르는 법',
    '배관 파손 없이 보수하는 ‘비굴착 보수 공업’의 미래',
    '앱으로 예약하는 정기 배관 케어 서비스의 장단점',

    // --- 법률, 보험 & 상식 (Legal & Common Sense) ---
    '아파트 전세 세입자 vs 집주인, 하수구 수리비는 누가 낼까?',
    '누수 피해 보상 합의서 작성 시 반드시 포함해야 할 내용',
    '상가 임대차 계약서에 배관 관리 책임 명시하는 법',
    '일상생활 배상책임 보험으로 층간 누수 해결한 실제 사례',
    '불법 배관 개조가 건축물 안전과 법률에 미치는 영향',
    '하수구 수리 업체 사칭 보이스피싱 구별하는 방법',
    '국가 지원 노후 주택 배관 공사 지원금 신청 자격',
    '배관 공사 표준 계약서 확인하고 분쟁 예방하기',

    // --- 긴급 상황 & 자가 진단 (Emergency & Self-Diagnosis) ---
    '단수 후 갑자기 물을 틀 때 배관 내부 공기(에어포켓) 빼기',
    '지진이나 태풍 후 하수구 역류 여부 확인하는 체크리스트',
    '벽 속에서 ‘텅텅’ 소리(워터해머 현상)가 날 때 방치하면 안 되는 이유',
    '욕실 슬리퍼가 물에 둥둥? 화장실 역류 긴급 대처 5단계',
    '수도 계량기 별표는 안 도는데 벽이 젖는다면? 외벽 누수 확인',
    '싱크대 아래가 늘 축축하다면? 실리콘 불량 vs 배관 누수',
    '변기 물이 천천히 내려갈 때, 구멍 막힘 vs 배터리 부족(전자식)',
    '하수구 뚫기 시도 중 스프링이 안에서 걸렸을 때 절대 당기지 마세요',
    '전문가 방문 전 우리가 미리 준비해두면 좋은 것들(작업 공간 확보)',
    '배관 수리 완료 후 고객이 직접 확인해야 할 체크포인트 3가지'
];

async function fetchWithRetry(url: string, options: any, maxRetries = 7) {
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
    const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    let currentKeyword = '';
    let usedModel = 'none';

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`[PostGen] [${jobType}] Operation started at: ${new Date().toISOString()}`);
        console.log('[PostGen] Checking Environment Variables:');
        console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING');
        console.log('- SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');
        console.log('- GEMINI_KEY:', process.env.GOOGLE_GEMINI_API_KEY ? 'OK' : 'MISSING');

        // Determine Post Type: 20% Info, 80% Service (Case Study)
        // [MODIFIED] Random distribution restored (was hardcoded for debug)
        const isInfoPost = Math.random() < 0.2;
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
                `3d render of blue water splash, clean and fresh, minimalist, bright blue background, 8k, high quality`,
                `shiny chrome plumbing wrench and tools on clean white surface, minimalist photography, bright studio lighting`,
                `abstract blue and white flowing water lines, modern graphic design, tech style, no text`,
                `clean modern bathroom interior, empty room, bright sunshine, white tile, sparkling clean`
            ];

            imageUrls = infoImagePrompts.map((p, index) => {
                const promptEnc = encodeURIComponent(`${p}, no people, no humans, object only`);
                const seed = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100000) + (index * 9999);
                return `https://image.pollinations.ai/prompt/${promptEnc}?width=1024&height=768&seed=${seed}&nologo=true`;
            });
            mainImageUrl = imageUrls[0];

            prompt = `
            당신은 20년 경력의 배관 전문가이자 지식 공유 전문가입니다.
            독자들에게 실질적인 도움이 되는 "순수 정보성" 블로그 글을 작성해주세요.

            정보:
            - 주제: ${topic}
            - 타겟 독자: ${TARGET_AUDIENCES[Math.floor(Math.random() * TARGET_AUDIENCES.length)]}
            - 글의 성격: 전문적/친절함/공익성

            제한사항(필수 준수):
            1. **상호명(전북하수구막힘), 전화번호(010), 광고성 링크를 제목과 본문에 절대 포함하지 마세요.**
            2. 이 글은 오로지 독자에게 정보를 전파하는 것이 목적입니다.
            3. 특정 업체를 추천하는 뉘앙스(진단이 필요하다면 전문가에게 등)도 최소화하세요.

            구조 요청:
            1. 제목은 <h1> 태그로 작성하되, 핵심 키워드 '${keyword}'를 포함하고 독자의 호기심을 유도하세요.
            2. 본문은 <h2>(소제목), <p>, <ul>, <li> 태그를 사용하여 가독성 있게 작성하세요.
            3. 각 소제목 아래에는 [IMG_1], [IMG_2], [IMG_3]를 적절히 배치하세요.
            4. SEO 최적화를 위해 관련 키워드를 자연스럽게 포함하세요.
            5. 마크다운이 아닌 HTML 태그만 출력하세요. (html, body 제외)
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
            // [Modified] User Request: Use simple abstract backgrounds for thumbnails, avoid humans entirely.
            const abstractPrompts = [
                'abstract clean blue gradient background, professional, high quality, 8k, no text',
                'modern bright bokeh background, cyan and white, minimalist, no text, empty',
                'soft blurred office background, professional atmosphere, bright lighting, abstract, no people',
                'clean water drop background, blue tones, fresh, hygiene concept, abstract, no people'
            ];

            // Select a random prompt for the thumbnail
            const thumbnailPrompt = abstractPrompts[Math.floor(Math.random() * abstractPrompts.length)];
            const imagePrompts = [thumbnailPrompt, thumbnailPrompt, thumbnailPrompt, thumbnailPrompt];

            imageUrls = imagePrompts.map((p, index) => {
                // Thumbnail uses Pollinations with abstract prompt
                const promptEnc = encodeURIComponent(`${p}, realistic, 4k, bright, abstract, no text, no people`);
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
            1. 글의 제목은 <h1> 태그로 작성하되, 반드시 핵심 키워드('${keyword}')를 포함하고, 제공된 '상황 연출(${usageContext})'의 내용을 구체적으로 반영하여 독자의 공감을 얻고 클릭을 유도하는 매력적인 문구여야 합니다. (예: 키워드 + 상황을 녹여낸 해결 사례 형식)
            2. 본문은 <h2>, <p>, <ul>, <li> 태그를 적절히 사용하여 가독성을 높여주세요.
            3. [IMG_1], [IMG_2], [IMG_3], [IMG_4]를 적절한 위치에 삽입하여 현장감을 살려주세요.
            4. 말투는 친절하고 전문적이어야 하며, 공감을 이끌어내는 스토리텔링 방식을 사용하세요.
            5. 마크다운이 아닌 적절한 HTML 포맷으로 출력해주세요. (html, head, body 태그 제외)
            `;
        }

        // B. Gemini Model Fallback Strategy
        const MODELS = [
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];
        let geminiData: GeminiResponse | null = null;
        let lastError: any = null;

        for (const model of MODELS) {
            usedModel = model;
            try {
                console.log(`[PostGen] Attempting with model: ${model}`);
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
                    const errorText = await response.text();
                    console.warn(`[PostGen] ${model} failed with status ${response.status}: ${errorText.substring(0, 200)}`);
                    throw new Error(`Model ${model} Error: ${response.status} ${errorText}`);
                }

                geminiData = (await response.json()) as GeminiResponse;
                if (!geminiData || !geminiData.candidates || geminiData.candidates.length === 0) {
                    throw new Error(`Model ${model} returned no candidates`);
                }
                console.log(`[PostGen] Success with model: ${model}`);
                break; // Success
            } catch (error: any) {
                console.warn(`[PostGen] Error with ${model}: ${error.message.substring(0, 200)}...`);
                lastError = error;
            }
        }

        if (!geminiData || !geminiData.candidates || geminiData.candidates.length === 0) {
            throw lastError || new Error('All Gemini models failed or returned empty response.');
        }

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
        let title = lines[0] ? lines[0].replace(/<h1>|<\/h1>|제목:|# /g, '').trim() : `${keyword} 마스터 가이드`;

        // [Fix] 지역명/키워드 중복 제거 (예: '전주 서신동 전주 서신동 ...')
        const titleWords = title.split(' ');
        const uniqueWords: string[] = [];
        titleWords.forEach((word: string) => {
            if (!uniqueWords.includes(word)) uniqueWords.push(word);
        });
        title = uniqueWords.join(' ');

        if (title.length > 70 || title.length < 5) {
            title = keyword;
        }

        let content = lines.slice(1).join('\n').trim();

        // [Safety] Strip accidental phone numbers
        title = stripPhoneNumbers(title);
        content = stripPhoneNumbers(content);

        if (isInfoPost) {
            // 정보성 글에서는 AI 이미지 대신 텍스트 중심의 "그래픽 카드" 생성
            const subtopics = content.match(/<h2[^>]*>(.*?)<\/h2>/g)?.map(h => h.replace(/<[^>]*>/g, '')) || [keyword];

            content = content.replace(/\[IMG_1\]/g, generateGraphicCardHtml(title, 1));
            content = content.replace(/\[IMG_2\]/g, generateGraphicCardHtml(subtopics[0] || keyword, 2));
            content = content.replace(/\[IMG_3\]/g, generateGraphicCardHtml(subtopics[1] || "기억해야 할 꿀팁!", 3));
            content = content.replace(/\[IMG_4\]/g, ''); // 정보성은 3장만

            // 메인 썸네일로 가장 예쁜 첫번째 카드를 설정하고 싶지만, image_url에는 URL이 필요하므로 
            // 썸네일은 고품질 스톡 이미지 느낌의 폴리네이션스 사용 (콘텐츠 내 이미지는 그래픽 카드)
            mainImageUrl = imageUrls[0];
        } else {
            // [Modified] User Request: "Background + Topic" style (Graphic Card) for ALL body images
            // We reuse generateGraphicCardHtml to create consistent, clean text-on-card images.

            content = content.replace(/\[IMG_1\]/g, generateGraphicCardHtml(`📍 ${fullLocation} ${service}<br>긴급 출동 서비스`, 10));
            content = content.replace(/\[IMG_2\]/g, generateGraphicCardHtml(`🛠️ ${service}<br>최신 장비로 완벽 해결`, 11));
            content = content.replace(/\[IMG_3\]/g, generateGraphicCardHtml(`✨ 꼼꼼한 원인 파악<br>및 확실한 시공`, 12));
            content = content.replace(/\[IMG_4\]/g, generateGraphicCardHtml(`👍 ${service} 작업 완료<br>A/S 철저 보장!`, 13));
        }
        content = content.replace(/\[IMG_[^\]]+\]/g, '');

        if (isInfoPost) {
            content += `
            <hr style="margin: 40px 0;" />
            <p style="color: #666; font-size: 0.9em;">※ 이 포스팅은 일상생활에 도움이 되는 배관 관리 꿀팁을 제공하기 위해 작성되었습니다. 더 전문적인 도움이 필요하실 경우 가까운 전문가와 상담하시기를 권장합니다.</p>
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

