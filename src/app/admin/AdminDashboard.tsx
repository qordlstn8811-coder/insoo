'use client';

import { createClient } from '@/lib/supabase';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { useManualGenerator } from '@/hooks/useManualGenerator';

// Components
import LoginForm from '@/components/admin/LoginForm';
import AutomationSettingsCard from '@/components/admin/AutomationSettingsCard';
import ManualGenerator from '@/components/admin/ManualGenerator';
import RealtimeLogs from '@/components/admin/RealtimeLogs';
import PostsTable from '@/components/admin/PostsTable';
import SystemLogsTable from '@/components/admin/SystemLogsTable';

export default function AdminDashboard() {
    const supabase = createClient();
    const { isAuthenticated, login, logout } = useAdminAuth();
    const {
        posts, dbLogs, settings, page, totalPages, isLoadingPosts,
        setPage, fetchPosts, fetchDbLogs, fetchAllData, updateSettings
    } = useAdminData(supabase, isAuthenticated);

    // Pass fetchAllData to refresh data during manual generation
    const {
        isLooping, targetCount, setTargetCount, logs,
        minDelay, setMinDelay, maxDelay, setMaxDelay,
        startLoop, stopLoop
    } = useManualGenerator(fetchAllData);

    const handleNextPage = () => {
        if (page < totalPages) setPage(p => p + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(p => p - 1);
    };

    if (!isAuthenticated) {
        return <LoginForm onLogin={login} />;
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                    <h1 className="text-xl font-bold text-gray-900">🚀 관리자 대시보드</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                            상태: <span className="font-bold text-green-600">정상 가동 중</span>
                        </div>
                        <button onClick={logout} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-3">

                {/* Left Column: Controls */}
                <div className="space-y-6 lg:col-span-1">
                    {/* 1. Cron Settings */}
                    <AutomationSettingsCard
                        isActive={settings.isActive}
                        targetCount={settings.dailyTarget}
                        startTime={settings.startTime}
                        endTime={settings.endTime}
                        onUpdate={updateSettings}
                    />

                    {/* 2. Manual Generation */}
                    <ManualGenerator
                        targetCount={targetCount}
                        setTargetCount={setTargetCount}
                        minDelay={minDelay}
                        setMinDelay={setMinDelay}
                        maxDelay={maxDelay}
                        setMaxDelay={setMaxDelay}
                        isLooping={isLooping}
                        startLoop={startLoop}
                        stopLoop={stopLoop}
                    />

                    {/* 3. Real-time Logs */}
                    <RealtimeLogs logs={logs} />
                </div>

                {/* Right Column: Data Tables */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Posts Table */}
                    <PostsTable
                        posts={posts}
                        page={page}
                        totalPages={totalPages}
                        isLoading={isLoadingPosts}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        onRefresh={() => fetchPosts(page)}
                    />

                    {/* System Logs Table */}
                    <SystemLogsTable
                        logs={dbLogs}
                        onRefresh={fetchDbLogs}
                    />

                </div>
            </div>
        </main>
    );
}
