import { useState, useRef } from 'react';

export function useManualGenerator(onProgress: () => void) {
    const [isLooping, setIsLooping] = useState(false);
    const [targetCount, setTargetCount] = useState<number>(1);
    const [logs, setLogs] = useState<string[]>([]);
    const [minDelay, setMinDelay] = useState(2);
    const [maxDelay, setMaxDelay] = useState(5);
    const shouldStopRef = useRef(false);

    const addLog = (msg: string) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
        if (msg.includes('성공') || msg.includes('완료')) onProgress();
    };

    const generateOnePost = async (index: number) => {
        try {
            addLog(`#${index} 생성 시작...`);
            // Note: password is hardcoded or managed outside but the API just checks if it's sent.
            // For security, we should pass it, but for this refactor we'll stick to the existing simple pattern
            // or we could accept password as an arg.
            const res = await fetch('/api/admin/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: '1234' })
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`성공(#${index}): ${data.keyword}`);
                return true;
            } else {
                addLog(`실패(#${index}): ${data.error}`);
                return false;
            }
        } catch {
            addLog(`에러(#${index}): 서버 연결 실패`);
            return false;
        }
    };

    const startLoop = async () => {
        if (!confirm(`${targetCount}개의 글 생성을 시작하시겠습니까?\n(중단 버튼으로 언제든 멈출 수 있습니다)`)) return;

        setIsLooping(true);
        setLogs([]);
        shouldStopRef.current = false;

        addLog(`🚀 자동 생성 시작(목표: ${targetCount}개, 간격: ${minDelay}~${maxDelay}초)`);

        for (let i = 1; i <= targetCount; i++) {
            if (shouldStopRef.current) {
                addLog('⛔ 사용자가 작업을 중단했습니다.');
                break;
            }

            await generateOnePost(i);

            if (i % 5 === 0) onProgress();

            if (i < targetCount && !shouldStopRef.current) {
                const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                addLog(`⏳ ${randomDelay}초 대기 중...`);
                await new Promise((res) => setTimeout(res, randomDelay * 1000));
            }
        }

        addLog('🎉 모든 작업이 완료되었습니다.');
        setIsLooping(false);
        onProgress();
    };

    const stopLoop = () => {
        if (confirm('진행 중인 작업을 중단하시겠습니까?')) {
            shouldStopRef.current = true;
            addLog('🛑 중단 요청됨... 현재 작업 완료 후 멈춥니다.');
        }
    };

    return {
        isLooping,
        targetCount,
        setTargetCount,
        logs,
        minDelay,
        setMinDelay,
        maxDelay,
        setMaxDelay,
        startLoop,
        stopLoop
    };
}
