'use client';

interface Log {
    id: string;
    created_at: string;
    status: string;
    job_type: string;
    title?: string;
    keyword?: string;
    model_used?: string;
    error_message?: string;
}

interface SystemLogsTableProps {
    logs: Log[];
    onRefresh: () => void;
}

export default function SystemLogsTable({ logs, onRefresh }: SystemLogsTableProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🤖 시스템 로그 (Supabase)</h2>
                <button onClick={onRefresh} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">새로고침</button>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                        <tr>
                            <th className="p-3">시간</th>
                            <th className="p-3">결과</th>
                            <th className="p-3">모델/내용</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleTimeString('ko-KR')}
                                </td>
                                <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {log.status === 'success' ? '성공' : '실패'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    {log.status === 'success' ? (
                                        <div>
                                            <div className="font-bold text-gray-900">{log.keyword}</div>
                                            <div className="text-xs text-gray-400">{log.model_used}</div>
                                        </div>
                                    ) : (
                                        <div className="text-red-500 font-medium">
                                            {log.error_message || '알 수 없는 오류'}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
