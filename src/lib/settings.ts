import { SupabaseClient } from '@supabase/supabase-js';

export interface CronSettings {
    isActive: boolean;
    dailyTarget: number;
    startTime: string; // "09:00"
    endTime: string;   // "22:00"
}

const DEFAULT_SETTINGS: CronSettings = {
    isActive: true,
    dailyTarget: 100,
    startTime: '08:00',
    endTime: '23:00'
};

export const SettingsService = {
    async getSettings(client: SupabaseClient): Promise<CronSettings> {
        try {
            const { data, error } = await client
                .from('posts')
                .select('content')
                .eq('title', 'SYSTEM_CRON_CONFIG')
                .single();

            if (error || !data) {
                await client.from('posts').insert([{
                    title: 'SYSTEM_CRON_CONFIG',
                    content: JSON.stringify(DEFAULT_SETTINGS),
                    status: 'draft',
                    keyword: 'SYSTEM',
                    category: 'SYSTEM'
                }]);
                return DEFAULT_SETTINGS;
            }

            return JSON.parse(data.content || '{}') as CronSettings;
        } catch {
            return DEFAULT_SETTINGS;
        }
    },

    async updateSettings(client: SupabaseClient, newSettings: CronSettings): Promise<void> {
        const { data } = await client
            .from('posts')
            .select('id')
            .eq('title', 'SYSTEM_CRON_CONFIG')
            .single();

        if (data) {
            const { error: updateError } = await client
                .from('posts')
                .update({
                    content: JSON.stringify(newSettings),
                    status: 'draft',
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.id);

            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await client
                .from('posts')
                .insert([{
                    title: 'SYSTEM_CRON_CONFIG',
                    content: JSON.stringify(newSettings),
                    status: 'draft',
                    keyword: 'SYSTEM',
                    category: 'SYSTEM'
                }]);

            if (insertError) throw insertError;
        }
    }
};
