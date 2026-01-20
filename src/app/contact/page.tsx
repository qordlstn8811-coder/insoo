'use client';

import { useState } from 'react';
import Header from '@/components/Header';


export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        region: '전주시',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', phone: '', region: '전주시', message: '' });
                alert('문의가 접수되었습니다. 담당자가 곧 연락드리겠습니다.');
            } else {
                setStatus('error');
                alert('문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } catch {
            setStatus('error');
            alert('오류가 발생했습니다.');
        } finally {
            setStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="bg-blue-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold mb-4">상담 문의</h1>
                        <p className="text-blue-100">궁금하신 점이 있으시면 언제든 문의주세요.</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">전화 상담이 가장 빠릅니다</h2>
                            <a href="tel:010-8184-3496" className="inline-flex items-center gap-3 text-4xl md:text-5xl font-extrabold text-blue-600 hover:text-blue-700 transition-colors">
                                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                010-8184-3496
                            </a>
                            <p className="text-gray-500 mt-4">365일 24시간 연중무휴 상담 가능</p>
                        </div>

                        <hr className="border-gray-100 my-12" />

                        <h3 className="text-xl font-bold text-gray-900 mb-6">온라인 문의하기</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="홍길동"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">거주 지역</label>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option>전주시</option>
                                    <option>군산시</option>
                                    <option>익산시</option>
                                    <option>완주군</option>
                                    <option>기타 지역</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">문의 내용 (선택)</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="증상을 자세히 적어주시면 상담이 더욱 정확해집니다."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? '접수 중...' : '문의 신청하기'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
