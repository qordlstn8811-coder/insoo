'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Post {
    id: string;
    title: string;
    keyword: string;
    image_url: string;
    created_at: string;
    category: string;
}

export default function RecentCases() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(4);

                if (error) throw error;
                if (data) setPosts(data);
            } catch (err) {
                console.error('Error fetching recent cases:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    if (loading) return null;
    if (posts.length === 0) return null;

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        실시간 시공 기록 & 정보
                    </h2>
                    <p className="text-slate-600 text-lg">
                        전북하수구막힘의 생생한 현장 기록과 유용한 배관 꿀팁을 확인하세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/cases/${post.id}`}
                                className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 h-full"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={post.image_url || '/images/hero.png'}
                                        alt={post.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                            {post.category || '시공사례'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-4">
                                        #{post.keyword}
                                    </p>
                                    <div className="flex items-center justify-between text-slate-400 text-xs border-t pt-4">
                                        <span>전문가 오다희</span>
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        href="/cases"
                        className="inline-flex items-center gap-2 text-slate-600 font-medium hover:text-blue-600 transition-colors"
                    >
                        전체 시공 사례 보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
