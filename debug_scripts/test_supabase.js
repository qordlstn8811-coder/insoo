
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
    console.log('🧪 Testing Supabase Connection...');

    try {
        // 1. Manually read .env.local to avoid module issues
        // 1. Manually read .env.local (Now synced!)
        const envPath = path.join(__dirname, '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env.local file not found!');
            return;
        }

        console.log('📄 Reading .env.local...');
        const envContent = fs.readFileSync(envPath, 'utf8');

        const output = {};
        console.log('File length:', envContent.length);
        console.log('Has NEXT_PUBLIC_SUPABASE_URL:', envContent.includes('NEXT_PUBLIC_SUPABASE_URL'));
        console.log('Has SUPABASE_SERVICE_ROLE_KEY:', envContent.includes('SUPABASE_SERVICE_ROLE_KEY'));

        // Attempt basic parsing for test
        const lines = envContent.split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/"/g, '');
                output[key] = val;
            }
        });

        const url = output['NEXT_PUBLIC_SUPABASE_URL'];
        const key = output['SUPABASE_SERVICE_ROLE_KEY'];

        if (!url || !key) {
            console.error('❌ Missing Supabase keys in .env.local');
            console.log(`URL found: ${!!url}, Key found: ${!!key}`);
            return;
        }

        console.log(`URL: ${url}`);
        console.log(`Key: ${key.substring(0, 10)}... (masked)`);

        // 2. Initialize Supabase
        const supabase = createClient(url, key);

        // 3. Test Write (Cron Logs)
        console.log('Attempting to write to cron_logs...');
        const { data, error } = await supabase
            .from('cron_logs')
            .insert([{
                job_type: 'manual',
                status: 'test',
                keyword: 'SYSTEM_TEST',
                title: 'Supabase Connection Test',
                model_used: 'none'
            }])
            .select();

        if (error) {
            console.error('❌ Insert Error:', error);
        } else {
            console.log('✅ Insert Success:', data);
        }

    } catch (e) {
        console.error('❌ Unexpected Error:', e);
    }
}

testSupabase();
