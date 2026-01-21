'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });
const FloatingButtons = dynamic(() => import('@/components/FloatingButtons'), { ssr: false });
const CallPopup = dynamic(() => import('@/components/CallPopup'), { ssr: false });
const StickyCallBar = dynamic(() => import('@/components/StickyCallBar'), { ssr: false });

export default function ClientLayoutElements() {
    const pathname = usePathname();

    // 관리자 페이지(/admin)에서는 렌더링하지 않음
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <Chatbot />
            <FloatingButtons />
            <CallPopup />
            <StickyCallBar />
        </>
    );
}
