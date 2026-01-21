'use client';

import { useState } from 'react';
import { CronSettings } from '@/lib/settings';

interface AutomationSettingsCardProps {
    isActive: boolean;
    targetCount: number;
    startTime: string;
    endTime: string;
    onUpdate: (newSettings: CronSettings) => Promise<void>;
}

export default function AutomationSettingsCard({ isActive, targetCount, startTime, endTime, onUpdate }: AutomationSettingsCardProps) {
    const [isSaving, setIsSaving] = useState(false);

    const baseSettings = {
        isActive,
        targetCount,
        startTime,
        endTime
    };

    const [draft, setDraft] = useState(baseSettings);
    const [isDirty, setIsDirty] = useState(false);

    const current = isDirty ? draft : baseSettings;

    const updateDraft = (updates: Partial<typeof baseSettings>) => {
        setDraft(prev => ({
            ...(isDirty ? prev : baseSettings),
            ...updates
        }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onUpdate({
            isActive: current.isActive,
            dailyTarget: current.targetCount,
            startTime: current.startTime,
            endTime: current.endTime
        });
        setIsSaving(false);
        setIsDirty(false);
        alert('설정이 저장되었습니다.');
    };

    return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2 text-blue-900">
                🤖 자동화 제어 (Cron)
                <span className={`px-2 py-0.5 text-xs rounded-full ${current.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {current.isActive ? 'ON' : 'OFF'}
                </span>
            </h2>

            <div className="space-y-4">
                {/* ON/OFF Switch */}
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100">
                    <span className="font-bold text-gray-700">자동 발행 상태</span>
                    <button
                        onClick={() => updateDraft({ isActive: !current.isActive })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${current.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${current.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Daily Target */}
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">하루 목표 발행량</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={current.targetCount}
                            onChange={(e) => updateDraft({ targetCount: Number(e.target.value) })}
                            className="w-full text-right rounded-lg border border-gray-300 p-3 font-bold text-gray-900 outline-none focus:border-blue-500"
                        />
                        <span className="text-gray-500">개</span>
                    </div>
                </div>

                {/* Operation Time */}
                <div>
                    <label className="mb-1 block text-sm font-bold text-gray-700">가동 시간 (0시~24시)</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="time"
                            value={current.startTime}
                            onChange={(e) => updateDraft({ startTime: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 p-2 text-center"
                        />
                        <span className="text-gray-500">~</span>
                        <input
                            type="time"
                            value={current.endTime}
                            onChange={(e) => updateDraft({ endTime: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-300 p-2 text-center"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? '저장 중...' : '설정 저장하기'}
                </button>
            </div>
        </div>
    );
}
