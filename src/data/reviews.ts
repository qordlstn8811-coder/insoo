// 후기 및 리뷰 데이터

export interface Review {
    id: number;
    name: string;
    region: string;
    dong: string;
    service: string;
    rating: number;
    content: string;
    date: string;
    verified: boolean;
}

// 실제 후기처럼 보이는 데이터 (SEO용)
export const reviews: Review[] = [
    {
        id: 1,
        name: '김**',
        region: '전주시',
        dong: '효자동',
        service: '하수구막힘',
        rating: 5,
        content: '아침에 갑자기 하수구가 역류해서 급하게 연락드렸는데 30분도 안되서 오셨어요. 친절하게 설명해주시고 깔끔하게 처리해주셨습니다. 가격도 합리적이었어요!',
        date: '2024-12-10',
        verified: true
    },
    {
        id: 2,
        name: '이**',
        region: '전주시',
        dong: '완산구',
        service: '싱크대막힘',
        rating: 5,
        content: '음식점 싱크대가 막혀서 영업을 못하고 있었는데 빠르게 와서 해결해주셨습니다. 고압세척으로 완전히 뚫어주시니 물이 시원하게 빠져요.',
        date: '2024-12-09',
        verified: true
    },
    {
        id: 3,
        name: '박**',
        region: '군산시',
        dong: '나운동',
        service: '변기막힘',
        rating: 5,
        content: '변기가 막혀서 정말 급했는데 밤 11시에도 출동 가능하다고 하셔서 바로 왔습니다. 20분만에 해결! 감사합니다.',
        date: '2024-12-08',
        verified: true
    },
    {
        id: 4,
        name: '최**',
        region: '익산시',
        dong: '영등동',
        service: '고압세척',
        rating: 5,
        content: '오래된 빌라라 배관이 자주 막혔는데 이번에 고압세척으로 확실하게 청소했더니 배수가 새것처럼 빨라졌어요.',
        date: '2024-12-07',
        verified: true
    },
    {
        id: 5,
        name: '정**',
        region: '전주시',
        dong: '덕진구',
        service: '배관내시경',
        rating: 5,
        content: '어디가 막혔는지 내시경으로 직접 보여주셔서 신뢰가 갔습니다. 작업 후에도 확인해주셔서 안심이 되었어요.',
        date: '2024-12-06',
        verified: true
    },
    {
        id: 6,
        name: '강**',
        region: '완주군',
        dong: '봉동읍',
        service: '하수구막힘',
        rating: 5,
        content: '시골이라 안올줄 알았는데 빨리 와주셨어요. 다른 업체는 거리가 멀다고 안왔는데 여기는 바로 오셔서 감사했습니다.',
        date: '2024-12-05',
        verified: true
    },
    {
        id: 7,
        name: '윤**',
        region: '전주시',
        dong: '송천동',
        service: '오수관막힘',
        rating: 5,
        content: '위층 아래층 다 역류하는 상황이었는데 원인을 정확히 찾아서 해결해주셨어요. 앞으로 배관 문제 있으면 무조건 여기로!',
        date: '2024-12-04',
        verified: true
    },
    {
        id: 8,
        name: '조**',
        region: '군산시',
        dong: '수송동',
        service: '싱크대막힘',
        rating: 5,
        content: '카페 운영중인데 갑자기 싱크대가 막혀서 당황했어요. 1시간 안에 오셔서 해결해주셔서 영업 차질 없이 끝났습니다.',
        date: '2024-12-03',
        verified: true
    },
    {
        id: 9,
        name: '한**',
        region: '익산시',
        dong: '모현동',
        service: '변기막힘',
        rating: 4,
        content: '신속하게 와서 처리해주셨어요. 가격도 전화로 안내받은 그대로였고, 추가 비용 없어서 좋았습니다.',
        date: '2024-12-02',
        verified: true
    },
    {
        id: 10,
        name: '임**',
        region: '전주시',
        dong: '인후동',
        service: '고압세척',
        rating: 5,
        content: '1년에 한번씩 정기적으로 청소 받고 있는데 항상 만족합니다. 배관 관리 잘해주셔서 막힘 걱정 없어요.',
        date: '2024-12-01',
        verified: true
    },
    {
        id: 11,
        name: '서**',
        region: '정읍시',
        dong: '수성동',
        service: '하수구막힘',
        rating: 5,
        content: '정읍까지 와주실줄 몰랐는데 정말 감사합니다. 친절하시고 꼼꼼하게 작업해주셨어요.',
        date: '2024-11-30',
        verified: true
    },
    {
        id: 12,
        name: '권**',
        region: '남원시',
        dong: '도통동',
        service: '배관청소',
        rating: 5,
        content: '남원에서도 빠르게 출동해주셨습니다. 오래된 집이라 배관 상태가 안좋았는데 깔끔하게 청소해주셨어요.',
        date: '2024-11-29',
        verified: true
    },
    {
        id: 13,
        name: '황**',
        region: '전주시',
        dong: '평화동',
        service: '하수구막힘',
        rating: 5,
        content: '주말에 급하게 연락드렸는데 바로 오셔서 해결해주셨어요. 다른 업체는 주말이라 비용이 2배라고 했는데 여기는 추가비용 없이 해결해주셨습니다.',
        date: '2024-11-28',
        verified: true
    },
    {
        id: 14,
        name: '배**',
        region: '군산시',
        dong: '조촌동',
        service: '싱크대막힘',
        rating: 5,
        content: '아파트 싱크대가 막혀서 전화했는데 1시간만에 도착해서 30분만에 완벽하게 뚫어주셨어요. 정말 감사합니다!',
        date: '2024-11-27',
        verified: true
    },
    {
        id: 15,
        name: '류**',
        region: '익산시',
        dong: '부송동',
        service: '변기막힘',
        rating: 5,
        content: '아이가 장난감을 변기에 빠뜨렸는데 손상 없이 깔끔하게 빼주셨어요. 다른 업체는 변기를 뜯어야 한다고 했는데 여기는 그냥 해결해주셨습니다.',
        date: '2024-11-26',
        verified: true
    },
    {
        id: 16,
        name: '노**',
        region: '전주시',
        dong: '중화산동',
        service: '고압세척',
        rating: 5,
        content: '음식점 운영중인데 배관이 자주 막혔어요. 고압세척 한번 받으니까 6개월째 문제없이 잘 사용중입니다.',
        date: '2024-11-25',
        verified: true
    },
    {
        id: 17,
        name: '하**',
        region: '김제시',
        dong: '요촌동',
        service: '하수구막힘',
        rating: 5,
        content: '김제까지 와주셔서 감사합니다. 시골이라 업체 찾기 힘들었는데 빠르게 출동해주셨어요.',
        date: '2024-11-24',
        verified: true
    },
    {
        id: 18,
        name: '양**',
        region: '완주군',
        dong: '삼례읍',
        service: '배관내시경',
        rating: 5,
        content: '배관 상태가 궁금해서 내시경 검사를 받았는데 화면으로 직접 보여주시면서 설명해주셔서 좋았어요.',
        date: '2024-11-23',
        verified: true
    },
    {
        id: 19,
        name: '송**',
        region: '전주시',
        dong: '금암동',
        service: '오수관막힘',
        rating: 5,
        content: '1층에서 계속 역류해서 스트레스였는데 오수관 청소하고 나서 완전히 해결됐어요. 다른 업체에서는 못뚫는다고 했는데 여기서 해결해주셨습니다.',
        date: '2024-11-22',
        verified: true
    },
    {
        id: 20,
        name: '오**',
        region: '군산시',
        dong: '미룡동',
        service: '싱크대막힘',
        rating: 4,
        content: '카페 싱크대가 막혀서 연락드렸더니 빠르게 와서 처리해주셨어요. 악취도 사라졌습니다.',
        date: '2024-11-21',
        verified: true
    },
    {
        id: 21,
        name: '문**',
        region: '익산시',
        dong: '남중동',
        service: '변기막힘',
        rating: 5,
        content: '새벽 2시에 변기가 막혔는데 진짜 출동 가능한지 반신반의했어요. 근데 30분만에 오셔서 해결해주셨습니다. 진짜 24시간 맞네요!',
        date: '2024-11-20',
        verified: true
    },
    {
        id: 22,
        name: '유**',
        region: '전주시',
        dong: '삼천동',
        service: '하수구막힘',
        rating: 5,
        content: '빌라 공용 하수관이 막혀서 이웃들이랑 같이 해결했어요. 친절하게 상황 설명해주시고 깔끔하게 처리해주셨습니다.',
        date: '2024-11-19',
        verified: true
    },
    {
        id: 23,
        name: '남**',
        region: '정읍시',
        dong: '시기동',
        service: '고압세척',
        rating: 5,
        content: '정읍에서 고압세척 해주는 곳 찾기 힘들었는데 다행히 여기서 해주셨어요. 배수가 정말 빨라졌습니다.',
        date: '2024-11-18',
        verified: true
    },
    {
        id: 24,
        name: '심**',
        region: '전주시',
        dong: '서신동',
        service: '배관청소',
        rating: 5,
        content: '이사 오기 전에 배관 청소를 부탁드렸는데 정말 깨끗하게 해주셨어요. 냄새도 안나고 좋습니다.',
        date: '2024-11-17',
        verified: true
    }
];

// 지역별 SEO 콘텐츠 생성 함수
export const generateRegionSEOContent = (regionName: string, dongName?: string) => {
    const location = dongName ? `${regionName} ${dongName}` : regionName;

    return {
        intro: `${location} 지역의 하수구막힘, 싱크대막힘, 변기막힘 문제로 고민이신가요? 전북배관은 ${location} 전지역에 24시간 긴급출동 서비스를 제공합니다. 30분 내 도착을 약속드립니다!`,

        services: [
            {
                title: `${location} 하수구막힘 해결`,
                content: `${location} 지역의 하수구막힘 문제는 대부분 기름때, 음식물 찌꺼기, 머리카락 등이 원인입니다. 특히 오래된 건물의 경우 배관 노후화로 인한 석회석 발생이 주요 원인이 되기도 합니다. 전북배관은 최신 고압세척 장비를 사용하여 막힌 하수구를 완벽하게 뚫어드립니다.`
            },
            {
                title: `${location} 싱크대 역류 수리`,
                content: `주방 싱크대에서 물이 역류하거나 악취가 나는 경우, 배관 내부에 기름 슬러지가 쌓여 있을 가능성이 높습니다. ${location} 지역 음식점, 가정집 싱크대막힘을 수천 건 해결한 경험을 바탕으로 신속하고 확실하게 처리해 드립니다.`
            },
            {
                title: `${location} 변기막힘 긴급처리`,
                content: `변기막힘은 생활에 큰 불편을 초래합니다. ${location} 지역 어디든 연락 주시면 30분 내에 도착하여 문제를 해결해 드립니다. 물티슈, 기저귀 등 이물질로 인한 막힘부터 배관 문제까지 모두 처리 가능합니다.`
            }
        ],

        whyUs: `왜 ${location} 주민들이 전북배관을 선택할까요? 첫째, 24시간 365일 긴급출동이 가능합니다. 둘째, 투명한 정찰제 가격으로 추가 비용 걱정이 없습니다. 셋째, 작업 후에도 같은 문제 발생 시 무상 A/S를 제공합니다.`,

        contact: `${location} 하수구막힘, 싱크대막힘, 변기막힘 문제로 고민이시라면 지금 바로 전화주세요. 전문 상담원이 친절하게 안내해 드리고, 숙련된 기술자가 신속하게 방문하여 문제를 해결해 드립니다.`
    };
};

// 지역별 리뷰 필터링
export const getReviewsByRegion = (regionName: string) => {
    return reviews.filter(r => r.region.includes(regionName));
};

// 랜덤 리뷰 가져오기 (실시간 피드용)
export const getRandomReviews = (count: number = 5) => {
    const shuffled = [...reviews].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export default { reviews, generateRegionSEOContent, getReviewsByRegion, getRandomReviews };
