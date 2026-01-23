'use client';

import { useEffect, useRef } from 'react';

// 간단한 브라우저 fingerprint 생성
function generateFingerprint(): string {
    const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        // Canvas fingerprint (간소화)
        typeof HTMLCanvasElement !== 'undefined' ? 'canvas' : 'no-canvas',
    ];

    // 간단한 해시 생성
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// 세션 ID 생성/조회
function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    const key = 'click_session_id';
    let sessionId = sessionStorage.getItem(key);

    if (!sessionId) {
        sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        sessionStorage.setItem(key, sessionId);
    }

    return sessionId;
}

// 네이버/구글 검색에서 유입되었는지 확인
function isFromSearchEngine(): boolean {
    if (typeof document === 'undefined') return false;

    const referer = document.referrer;
    return referer.includes('search.naver.com') ||
        referer.includes('naver.com') ||
        referer.includes('google.com') ||
        referer.includes('google.co.kr') ||
        referer.includes('daum.net');
}

// 이미 이번 세션에서 추적했는지 확인
function hasTrackedThisSession(): boolean {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('click_tracked') === 'true';
}

function markAsTracked(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('click_tracked', 'true');
}

export default function ClickTracker() {
    const trackedRef = useRef(false);

    useEffect(() => {
        // 이미 추적했으면 스킵
        if (trackedRef.current || hasTrackedThisSession()) {
            return;
        }

        // 검색엔진에서 유입되었거나, 직접 방문인 경우만 추적
        // (모든 방문을 추적하고 싶으면 이 조건 제거)
        const shouldTrack = isFromSearchEngine() || !document.referrer;

        if (!shouldTrack) {
            return;
        }

        trackedRef.current = true;

        const trackClick = async () => {
            try {
                const sessionId = getOrCreateSessionId();
                const fingerprint = generateFingerprint();

                await fetch('/api/track/click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        fingerprint,
                        pageUrl: window.location.href,
                        referer: document.referrer,
                    }),
                });

                markAsTracked();
            } catch (error) {
                // 추적 실패해도 사용자 경험에 영향 없음
                console.debug('[ClickTracker] Failed to track:', error);
            }
        };

        // 약간의 딜레이 후 추적 (페이지 로드 성능 영향 최소화)
        const timer = setTimeout(trackClick, 500);

        return () => clearTimeout(timer);
    }, []);

    // 렌더링하지 않음
    return null;
}
