'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
    id: number;
    text: string;
    isUser: boolean;
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: '안녕하세요! 전북하수구막힘입니다. \n무엇을 도와드릴까요?', isUser: false },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageIdRef = useRef(2);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleOptionClick = (option: string) => {
        // 사용자 질문 추가
        const userMsgId = messageIdRef.current++;
        const userMsg: Message = { id: userMsgId, text: option, isUser: true };
        setMessages((prev) => [...prev, userMsg]);

        // 답변 로직 (1초 딜레이 효과)
        setTimeout(() => {
            let answer = '';
            switch (option) {
                case '💰 비용 문의':
                    answer = '기본 출장비는 0원입니다! \n정확한 견적은 현장 상황 확인 후 안내해 드립니다. \n과잉 청구 절대 없습니다.';
                    break;
                case '📍 출장 지역':
                    answer = '전주, 익산, 군산, 김제, 완주 등 \n전북 전 지역 언제든 출동 가능합니다!';
                    break;
                case '🕒 작업 시간':
                    answer = '24시간 연중무휴 상담 및 출동 가능합니다. \n급한 막힘, 지금 바로 연락주세요!';
                    break;
                case '📞 전화 상담':
                    answer = '010-8184-3496 \n(클릭하시면 바로 연결됩니다)';
                    break;
                default:
                    answer = '상담원이 필요하시면 전화로 문의주세요.';
            }
            const botMsg: Message = { id: messageIdRef.current++, text: answer, isUser: false };
            setMessages((prev) => [...prev, botMsg]);
        }, 500);
    };

    return (
        <>
            {/* 챗봇 버튼 (우측 하단) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-transform hover:scale-110 focus:outline-none"
                aria-label="채팅 상담 열기"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* 챗봇 창 */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-fade-in-up sm:w-96">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 overflow-hidden rounded-full bg-white/20 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-full w-full">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">전북하수구막힘 상담봇</h3>
                                <span className="flex items-center text-xs text-blue-100">
                                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-400"></span>
                                    운영중
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* 메시지 영역 */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                {!msg.isUser && (
                                    <div className="mr-2 h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                                        🤖
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    {msg.text.includes('010-8184-3496') ? (
                                        <a href="tel:01081843496" className="underline font-bold hover:text-blue-200">
                                            {msg.text}
                                        </a>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 옵션 버튼 영역 */}
                    <div className="border-t border-gray-100 bg-white p-3">
                        <p className="mb-2 text-xs font-medium text-gray-500 text-center">자주 묻는 질문</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['💰 비용 문의', '📍 출장 지역', '🕒 작업 시간', '📞 전화 상담'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleOptionClick(opt)}
                                    className="rounded-lg border border-gray-200 bg-white py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
