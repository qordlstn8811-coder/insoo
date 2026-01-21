'use client';

import { useState } from 'react';

interface LoginFormProps {
    onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple client-side password check as per original functionality
        if (password === '1234') {
            onLogin();
        } else {
            alert('비밀번호가 틀렸습니다.');
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
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
                <button type="submit" className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl">
                    로그인
                </button>
            </form>
        </main>
    );
}
