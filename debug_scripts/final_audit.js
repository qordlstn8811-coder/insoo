const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function audit() {
    console.log('--- Post Category Audit ---');
    const { data: posts } = await supabase.from('posts').select('id, category, title, keyword').order('created_at', { ascending: false }).limit(10);
    if (posts) {
        posts.forEach(p => {
            console.log(`[${p.category || 'N/A'}] ${p.title} (${p.keyword})`);
        });
    }

    console.log('\n--- Cron Logs Audit ---');
    const { data: logs } = await supabase.from('cron_logs').select('*').order('created_at', { ascending: false }).limit(10);
    if (logs) {
        logs.forEach(l => {
            const time = new Date(l.created_at).toLocaleString('ko-KR');
            console.log(`${time} | ${l.status} | ${l.job_type} | ${l.model_used} | ${l.title || l.keyword}`);
        });
    }
}

audit();
