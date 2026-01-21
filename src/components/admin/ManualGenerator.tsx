'use client';

interface ManualGeneratorProps {
    targetCount: number;
    setTargetCount: (count: number) => void;
    minDelay: number;
    setMinDelay: (delay: number) => void;
    maxDelay: number;
    setMaxDelay: (delay: number) => void;
    isLooping: boolean;
    startLoop: () => void;
    stopLoop: () => void;
}

export default function ManualGenerator({
    targetCount,
    setTargetCount,
    minDelay,
    setMinDelay,
    maxDelay,
    setMaxDelay,
    isLooping,
    startLoop,
    stopLoop
}: ManualGeneratorProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">⚡ 수동 생성 (테스트)</h2>
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">생성 개수</label>
                    <input
                        type="number"
                        value={targetCount}
                        onChange={(e) => setTargetCount(Number(e.target.value))}
                        disabled={isLooping}
                        className="w-full rounded-lg border border-gray-300 p-3"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500">최소 딜레이(초)</label>
                        <input
                            type="number"
                            value={minDelay}
                            onChange={(e) => setMinDelay(Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 p-2 text-center"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">최대 딜레이(초)</label>
                        <input
                            type="number"
                            value={maxDelay}
                            onChange={(e) => setMaxDelay(Number(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 p-2 text-center"
                        />
                    </div>
                </div>

                {!isLooping ? (
                    <button
                        onClick={startLoop}
                        className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-md hover:bg-indigo-700"
                    >
                        생성 시작
                    </button>
                ) : (
                    <button
                        onClick={stopLoop}
                        className="w-full rounded-xl bg-red-500 py-3 font-bold text-white shadow-md hover:bg-red-600 animate-pulse"
                    >
                        작업 중단 (진행 중...)
                    </button>
                )}
            </div>
        </div>
    );
}
