import { useState, useCallback, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { SettingsService, CronSettings } from '@/lib/settings';

interface Post {
    id: string;
    created_at: string;
    status: string;
    title: string | null;
    keyword: string | null;
    image_url: string | null;
}

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

export function useAdminData(supabase: SupabaseClient, isAuthenticated: boolean) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [dbLogs, setDbLogs] = useState<Log[]>([]);
    const [settings, setSettings] = useState<CronSettings>({
        isActive: true,
        dailyTarget: 100,
        startTime: '08:00',
        endTime: '22:00'
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const ITEMS_PER_PAGE = 20;

    const fetchPosts = useCallback(async (pageNumber: number) => {
        setIsLoadingPosts(true);
        try {
            const start = (pageNumber - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE - 1;

            const { data, count, error } = await supabase
                .from('posts')
                .select('*', { count: 'exact' })
                .neq('status', 'system')
                .order('created_at', { ascending: false })
                .range(start, end);

            if (error) throw error;

            if (data) setPosts(data);
            if (count) setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoadingPosts(false);
        }
    }, [supabase]);

    const fetchDbLogs = useCallback(async () => {
        const { data: logData } = await supabase
            .from('cron_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);
        if (logData) setDbLogs(logData);
    }, [supabase]);

    const fetchSettings = useCallback(async () => {
        const current = await SettingsService.getSettings(supabase);
        setSettings(current);
    }, [supabase]);

    const updateSettings = async (newSettings: CronSettings) => {
        await SettingsService.updateSettings(supabase, newSettings);
        setSettings(newSettings);
    };

    const fetchAllData = useCallback(async () => {
        await Promise.all([
            fetchPosts(page),
            fetchDbLogs()
        ]);
    }, [fetchPosts, fetchDbLogs, page]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPosts(page);
            fetchDbLogs();
            fetchSettings();
        }
    }, [isAuthenticated, page, fetchPosts, fetchDbLogs, fetchSettings]);

    return {
        posts,
        dbLogs,
        settings,
        page,
        totalPages,
        isLoadingPosts,
        setPage,
        fetchPosts,
        fetchDbLogs,
        fetchAllData,
        updateSettings
    };
}
