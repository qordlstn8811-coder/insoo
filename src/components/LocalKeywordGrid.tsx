import React from 'react';

const neighborhoodData = {
    '전주 완산구': ['중앙동', '풍남동', '노송동', '완산동', '동서학동', '서서학동', '중화산동', '서신동', '평화동', '삼천동', '효자동'],
    '전주 덕진구': ['진북동', '인후동', '덕진동', '금암동', '팔복동', '우아동', '호성동', '송천동', '조촌동', '여의동', '혁신동'],
    '전북 주요지역': ['군산시', '익산시', '완주군', '김제시', '정읍시', '남원시']
};

const services = ['하수구막힘', '변기막힘', '싱크대막힘', '배관수리', '누수탐지'];

export default function LocalKeywordGrid() {
    return (
        <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-8 border-l-4 border-blue-600 pl-3">
                    전북하수구막힘 서비스 가능 지역
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.entries(neighborhoodData).map(([region, neighborhoods]) => (
                        <div key={region} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-blue-700 mb-4">{region}</h3>
                            <div className="flex flex-wrap gap-2">
                                {neighborhoods.map((name, idx) => {
                                    const service = services[idx % services.length];
                                    return (
                                        <span
                                            key={name}
                                            className="text-xs text-gray-500 hover:text-blue-600 cursor-default"
                                        >
                                            {name}{service},
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-400">
                        #전주하수구막힘 #전주변기막힘 #전주싱크대막힘 #전주내시경검사 #전주고압세척 #전주누수탐지 #완산구하수구막힘 #덕진구하수구막힘 #전북하수구막힘
                    </p>
                </div>
            </div>
        </section>
    );
}
