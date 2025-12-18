
import { supabase } from './supabase';

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

const SETTINGS_ID = 'system-cron-settings'; // 고정 ID (UUID 형식이 아니라면 에러날 수 있으니 확인 필요. Supabase는 보통 UUID. 
// 안전하게 타이틀로 조회하거나, 최초 생성 후 ID를 고정해서 쓰는 방식 사용. 
// 여기서는 "title"이 "SYSTEM_CONFIG"인 row를 찾아서 사용.

export const SettingsService = {
    async getSettings(): Promise<CronSettings> {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('content')
                .eq('title', 'SYSTEM_CRON_CONFIG') // 식별자
                .eq('status', 'system')           // 식별자
                .single();

            if (error || !data) {
                // 없으면 생성 (첫 실행 시)
                console.log('설정이 없어 기본값을 생성합니다.');
                await this.updateSettings(DEFAULT_SETTINGS);
                return DEFAULT_SETTINGS;
            }

            return JSON.parse(data.content || '{}') as CronSettings;
        } catch (e) {
            console.error('설정 로드 실패:', e);
            return DEFAULT_SETTINGS;
        }
    },

    async updateSettings(newSettings: CronSettings): Promise<void> {
        // Upsert logic
        // 먼저 존재하는지 확인
        const { data } = await supabase
            .from('posts')
            .select('id')
            .eq('title', 'SYSTEM_CRON_CONFIG')
            .single();

        if (data) {
            // Update
            await supabase
                .from('posts')
                .update({
                    content: JSON.stringify(newSettings),
                    status: 'system', // public 목록에 안 뜨게
                    updated_at: new Date().toISOString()
                })
                .eq('id', data.id);
        } else {
            // Insert
            await supabase
                .from('posts')
                .insert({
                    title: 'SYSTEM_CRON_CONFIG',
                    content: JSON.stringify(newSettings),
                    status: 'system',
                    keyword: 'SYSTEM',
                    category: 'SYSTEM'
                });
        }
    }
};
