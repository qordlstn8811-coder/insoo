
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '상담문의 | 전북배관',
    description: '전북 전지역 하수구, 변기, 싱크대 막힘 24시간 상담 문의',
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
