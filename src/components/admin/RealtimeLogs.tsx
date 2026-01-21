'use client';

interface RealtimeLogsProps {
    logs: string[];
}

export default function RealtimeLogs({ logs }: RealtimeLogsProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-900 p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-400">🖥️ 실시간 터미널 로그</h2>
            <div className="h-64 overflow-y-auto rounded-lg bg-black p-4 font-mono text-xs text-green-400 border border-gray-800">
                {logs.length === 0 ? (
                    <span className="text-gray-600">대기 중...</span>
                ) : (
                    logs.map((log, i) => <div key={i}>{log}</div>)
                )}
            </div>
        </div>
    );
}
