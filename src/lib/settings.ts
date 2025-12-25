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
                // 없으면 생성 (첫 실행 시)
                console.log('설정이 없어 기본값을 생성합니다.');
                // 재귀 호출 방지를 위해 여기서 직접 insert
                await client.from('posts').insert({
                    title: 'SYSTEM_CRON_CONFIG',
                    content: JSON.stringify(DEFAULT_SETTINGS),
                    status: 'draft', // 'system' 대신 'draft' 사용 (Enum 충돌 방지)
                    keyword: 'SYSTEM',
                    category: 'SYSTEM'
                });
                return DEFAULT_SETTINGS;
            }

            return JSON.parse(data.content || '{}') as CronSettings;
        } catch (e) {
            console.error('설정 로드 실패:', e);
            return DEFAULT_SETTINGS;
        }
    },

    async updateSettings(client: SupabaseClient, newSettings: CronSettings): Promise<void> {
        try {
            // Upsert logic
            const { data } = await client
                .from('posts')
                .select('id')
                .eq('title', 'SYSTEM_CRON_CONFIG')
                .single();

            if (data) {
                // Update
                const { error: updateError } = await client
                    .from('posts')
                    .update({
                        content: JSON.stringify(newSettings),
                        status: 'draft',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', data.id);

                if (updateError) throw updateError;
                console.log('설정 업데이트 성공');
            } else {
                // Insert
                const { error: insertError } = await client
                    .from('posts')
                    .insert({
                        title: 'SYSTEM_CRON_CONFIG',
                        content: JSON.stringify(newSettings),
                        status: 'draft',
                        keyword: 'SYSTEM',
                        category: 'SYSTEM'
                    });

                if (insertError) throw insertError;
                console.log('설정 신규 생성 성공');
            }
        } catch (e) {
            console.error('설정 저장 중 치명적 오류:', e);
            throw e; // 호출한 곳(UI)에서 에러를 인지할 수 있게 던짐
        }
    }
};
