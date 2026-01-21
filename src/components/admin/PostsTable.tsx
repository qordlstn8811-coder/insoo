'use client';

interface Post {
    id: string;
    created_at: string;
    status: string;
    title: string | null;
    keyword: string | null;
    image_url: string | null;
}

interface PostsTableProps {
    posts: Post[];
    page: number;
    totalPages: number;
    isLoading: boolean;
    onNextPage: () => void;
    onPrevPage: () => void;
    onRefresh: () => void;
}

export default function PostsTable({
    posts,
    page,
    totalPages,
    isLoading,
    onNextPage,
    onPrevPage,
    onRefresh
}: PostsTableProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">📝 최근 발행된 글</h2>
                <button onClick={onRefresh} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">새로고침</button>
            </div>

            {isLoading ? (
                <div className="py-10 text-center text-gray-500">로딩 중...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3">상태</th>
                                <th className="p-3">제목/키워드</th>
                                <th className="p-3">작성일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition">
                                    <td className="p-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold text-gray-900 line-clamp-1">{post.title || '(제목 없음)'}</div>
                                        <div className="text-xs text-gray-500">{post.keyword}</div>
                                    </td>
                                    <td className="p-3 text-gray-500">
                                        {new Date(post.created_at).toLocaleString('ko-KR', {
                                            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-400">데이터가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
                <button
                    onClick={onPrevPage}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                >
                    이전
                </button>
                <span className="text-sm font-bold text-gray-600">{page} / {totalPages}</span>
                <button
                    onClick={onNextPage}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
