'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

// 스크롤 시 페이드인 + 위로 올라오는 애니메이션
export function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// 스태거드 카드 컨테이너
export function AnimatedCardGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// 개별 카드 아이템
export function AnimatedCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 40, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, ease: 'easeOut' }
                },
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                transition: { duration: 0.3 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// 배지/태그용 애니메이션
export function AnimatedBadge({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay }}
            whileHover={{ scale: 1.1 }}
            className={className}
        >
            {children}
        </motion.span>
    );
}

// 펄스 CTA 버튼
export function PulseCTA({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <motion.div
            animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                    '0 0 0 20px rgba(59, 130, 246, 0)',
                    '0 0 0 0 rgba(59, 130, 246, 0)',
                ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// 텍스트 타이핑 효과 (한글자씩)
export function TypewriterText({ text, className = '' }: { text: string; className?: string }) {
    return (
        <motion.span className={className}>
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.05, delay: i * 0.03 }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
}

// 카운트업 숫자
export function CountUp({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={className}
        >
            <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                {value}{suffix}
            </motion.span>
        </motion.span>
    );
}
