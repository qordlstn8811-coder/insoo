'use client';

import { Phone, MessageCircle } from 'lucide-react';

export default function StickyCallBar() {
    const phoneNumber = '010-8184-3496';

    return (
        <div className="fixed bottom-0 left-0 z-50 flex w-full items-center border-t border-gray-200 bg-white pb-safe pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
            <div className="flex w-full gap-2 px-4 pb-2">
                <a
                    href={`sms:${phoneNumber}`}
                    className="flex flex-1 flex-col items-center justify-center rounded-xl bg-gray-100 py-3 text-gray-800 transition active:bg-gray-200"
                >
                    <MessageCircle className="mb-1 h-6 w-6" />
                    <span className="text-xs font-bold">문자 문의</span>
                </a>
                <a
                    href={`tel:${phoneNumber}`}
                    className="flex flex-[2] flex-col items-center justify-center rounded-xl bg-blue-600 py-3 text-white shadow-lg transition active:bg-blue-700"
                >
                    <Phone className="mb-1 h-6 w-6" />
                    <span className="text-base font-bold">전화 상담하기</span>
                </a>
            </div>
        </div>
    );
}
