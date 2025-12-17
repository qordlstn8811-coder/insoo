'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminPage() {
    // 상태 관리
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 생성 관련 상태
    const [isLooping, setIsLooping] = useState(false);
    const [targetCount, setTargetCount] = useState<number>(1);
    const [successCount, setSuccessCount] = useState(0);
    const [failCount, setFailCount] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [minDelay, setMinDelay] = useState(2); // 최소 간격 (초)
    const [maxDelay, setMaxDelay] = useState(5); // 최대 간격 (초)

    // 중단 제어용 ref
    const shouldStopRef = useRef(false);

    // 1. 로그인 처리
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            fetchPosts();
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    // 2. 게시글 목록 불러오기
    const fetchPosts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setPosts(data);
        setLoading(false);
    };

    // 3. 로그 추가 함수
    const addLog = (msg: string) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    // 4. 단일 생성 요청 함수
    const generateOnePost = async (index: number) => {
        try {
            addLog(`#${index} 생성 시작...`);
            const res = await fetch('/api/generate-post', { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                addLog(`✅ 성공 (#${index}): ${data.keyword}`);
                setSuccessCount((prev) => prev + 1);
                return true;
            } else {
                addLog(`❌ 실패 (#${index}): ${data.error}`);
                setFailCount((prev) => prev + 1);
                return false;
            }
        } catch (e) {
            addLog(`❌ 에러 (#${index}): 서버 연결 실패`);
            setFailCount((prev) => prev + 1);
            return false;
        }
    };

    // 5. 반복 생성 시작 (랜덤 간격 적용)
    const startLoop = async () => {
        if (!confirm(`${targetCount}개의 글 생성을 시작하시겠습니까?\n(중단 버튼으로 언제든 멈출 수 있습니다)`)) return;

        setIsLooping(true);
        setSuccessCount(0);
        setFailCount(0);
        setLogs([]);
        shouldStopRef.current = false;

        addLog(`🚀 자동 생성 시작 (목표: ${targetCount}개, 간격: ${minDelay}~${maxDelay}초)`);

        for (let i = 1; i <= targetCount; i++) {
            // 중단 체크
            if (shouldStopRef.current) {
                addLog('⛔ 사용자가 작업을 중단했습니다.');
                break;
            }

            await generateOnePost(i);

            // 목록 중간 갱신
            if (i % 5 === 0) fetchPosts();

            // 랜덤 딜레이 (마지막 작업이 아닐 때만)
            if (i < targetCount && !shouldStopRef.current) {
                const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                addLog(`⏳ ${randomDelay}초 대기 중...`);
                await new Promise((res) => setTimeout(res, randomDelay * 1000));
            }
        }

        addLog('🎉 모든 작업이 완료되었습니다.');
        setIsLooping(false);
        fetchPosts();
    };

    // 6. 작업 중단
    const stopLoop = () => {
        if (confirm('진행 중인 작업을 중단하시겠습니까?')) {
            shouldStopRef.current = true;
            addLog('🛑 중단 요청됨... 현재 작업 완료 후 멈춥니다.');
        }
    };

    // --- 렌더링: 로그인 화면 ---
    if (!isAuthenticated) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">🔒 관리자 접속</h1>
                        <p className="text-sm text-gray-500 mt-2">전북하수구 관리자 전용</p>
                    </div>
                    <div className="mb-6">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-4 font-mono text-center text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            placeholder="Password"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-md"
                    >
                        접속하기
                    </button>
                </form>
            </main>
        );
    }

    // --- 렌더링: 대시보드 ---
    return (
        <main className="container mx-auto min-h-screen max-w-6xl px-4 py-8 bg-gray-50/50">
            {/* 상단 헤더 */}
            <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">🛠️ 자동화 센터</h1>
                    <p className="text-gray-500">AI가 자동으로 블로그 콘텐츠를 생산합니다.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        현재 글: {posts.length}개
                    </div>
                    <button
                        onClick={() => setIsAuthenticated(false)}
                        className="text-sm font-medium text-gray-400 hover:text-red-500 transition"
                    >
                        로그아웃
                    </button>
                </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* 왼쪽: 컨트롤 패널 */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 1. 작업 설정 카드 */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                            ⚙️ 작업 설정
                            {isLooping && <span className="animate-pulse text-xs text-red-500">● 작동 중</span>}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">생성할 글 갯수</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={targetCount}
                                        onChange={(e) => setTargetCount(Number(e.target.value))}
                                        disabled={isLooping}
                                        className="w-full text-right rounded-lg border border-gray-300 p-3 font-bold text-gray-900 outline-none focus:border-blue-500"
                                    />
                                    <span className="text-gray-500">개</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    {[1, 5, 10, 50, 100].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => setTargetCount(num)}
                                            disabled={isLooping}
                                            className="flex-1 rounded-md bg-gray-100 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                                        >
                                            {num}개
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-bold text-gray-700">생성 간격 (랜덤)</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={minDelay}
                                        onChange={(e) => setMinDelay(Number(e.target.value))}
                                        disabled={isLooping}
                                        className="w-20 rounded-lg border border-gray-300 p-2 text-sm text-center"
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={maxDelay}
                                        onChange={(e) => setMaxDelay(Number(e.target.value))}
                                        disabled={isLooping}
                                        className="w-20 rounded-lg border border-gray-300 p-2 text-sm text-center"
                                    />
                                    <span className="text-gray-500">초</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">매번 다른 간격으로 발행 (자연스러움 ↑)</p>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="flex gap-2 text-center text-sm">
                                <div className="flex-1 rounded-lg bg-green-50 p-2">
                                    <div className="font-bold text-green-600">{successCount}</div>
                                    <div className="text-xs text-green-800">성공</div>
                                </div>
                                <div className="flex-1 rounded-lg bg-red-50 p-2">
                                    <div className="font-bold text-red-600">{failCount}</div>
                                    <div className="text-xs text-red-800">실패</div>
                                </div>
                            </div>

                            {!isLooping ? (
                                <button
                                    onClick={startLoop}
                                    className="w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    ▶ 작업 시작하기
                                </button>
                            ) : (
                                <button
                                    onClick={stopLoop}
                                    className="w-full rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                >
                                    ⏹ 작업 중단하기
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 2. 로그 창 */}
                    <div className="rounded-2xl border border-gray-200 bg-gray-900 p-4 shadow-sm h-64 flex flex-col">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-400">
                            <span>SYSTEM LOG</span>
                            <button onClick={() => setLogs([])} className="hover:text-white">Clear</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700 pr-2">
                            {logs.length === 0 && <span className="text-gray-600 text-xs text-center block mt-10">대기 중...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-xs font-mono text-green-400 border-b border-gray-800 pb-1 mb-1 last:border-0">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 게시글 목록 */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">📋 발행 목록</h2>
                        <button onClick={fetchPosts} className="text-sm font-medium text-blue-600 hover:underline">목록 새로고침</button>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        {loading && <div className="p-10 text-center text-gray-500 bg-gray-50">데이터를 불러오는 중입니다...</div>}
                        {!loading && posts.length === 0 && (
                            <div className="p-10 text-center text-gray-400">
                                아직 발행된 글이 없습니다. <br />
                                왼쪽에서 작업을 시작해보세요!
                            </div>
                        )}

                        <div className="divide-y divide-gray-100">
                            {posts.map((post) => (
                                <div key={post.id} className="flex gap-4 p-4 hover:bg-gray-50 transition items-center">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                        {post.image_url ? (
                                            <Image src={post.image_url} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">img</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded w-fit ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {post.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                        <a href={`/cases/${post.id}`} target="_blank" className="truncate font-bold text-gray-900 block hover:text-blue-600 mb-0.5">
                                            {post.title || '제목 없음'}
                                        </a>
                                        <p className="truncate text-xs text-gray-500">Keyword: {post.keyword}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!confirm('정말 이 글을 삭제하시겠습니까?')) return;

                                            try {
                                                const { error } = await supabase
                                                    .from('posts')
                                                    .delete()
                                                    .eq('id', post.id);

                                                if (error) throw error;

                                                addLog(`✅ 글 삭제 완료: ${post.title}`);
                                                fetchPosts(); // 목록 새로고침
                                            } catch (err: any) {
                                                addLog(`❌ 삭제 실패: ${err.message}`);
                                            }
                                        }}
                                        className="flex-shrink-0 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                                    >
                                        🗑️ 삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
