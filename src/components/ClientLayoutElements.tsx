'use client';

import { usePathname } from 'next/navigation';
import Chatbot from "@/components/Chatbot";
import FloatingButtons from "@/components/FloatingButtons";
import CallPopup from "@/components/CallPopup";
import StickyCallBar from "@/components/StickyCallBar";

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
