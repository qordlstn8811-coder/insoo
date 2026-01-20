'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
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
                setPosts(data || []);
            } catch (err) {
                console.error('Error fetching recent cases:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-[350px]" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="py-16 bg-slate-50/50">
            <div className="container mx-auto px-4">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">최근 시공 사례</h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        전북 지역 곳곳의 하수구, 변기, 싱크대 막힘 문제를 해결한 생생한 현장 기록입니다.
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
                                    <SafeImage
                                        src={post.image_url || '/images/hero.png'}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                            {post.category || '시공사례'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{post.keyword || '전북'}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h3>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/cases"
                        className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition-all hover:border-slate-300"
                    >
                        전체 시공 사례 보기
                    </Link>
                </div>
            </div>
        </section>
    );
}
