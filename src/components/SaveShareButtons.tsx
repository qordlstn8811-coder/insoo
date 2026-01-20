'use client';

import { useState } from 'react';

export default function SaveShareButtons({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            alert('주소가 복사되었습니다! 필요한 곳에 붙여넣기 하세요.');
        } catch {
            // Fallback: do nothing if clipboard fails
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `${title} - 전북하수구막힘 시공사례`,
                    url: window.location.href,
                });
            } catch {
                handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="my-8 flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-6 sm:flex-row">
            <div className="text-center sm:text-left">
                <h4 className="font-bold text-gray-900">💡 이 정보가 유용했나요?</h4>
                <p className="text-sm text-gray-600">나중에 다시 보시려면 저장해두세요!</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
                >
                    {copied ? '✅ 복사완료' : '🔗 주소복사'}
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-md transition hover:bg-blue-700"
                >
                    📤 공유하기
                </button>
            </div>
        </div>
    );
}
