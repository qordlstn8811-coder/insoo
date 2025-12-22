
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const output = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/"/g, '');
        output[key] = val;
    }
});

const supabase = createClient(
    output['NEXT_PUBLIC_SUPABASE_URL'],
    output['SUPABASE_SERVICE_ROLE_KEY']
);

console.log('👀 Monitoring Cron Logs (Ctrl+C to stop)...');
console.log('------------------------------------------------');

let lastSeenId = null;

async function checkLogs() {
    try {
        let query = supabase
            .from('cron_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // If we have seen logs, only get newer ones? 
        // Polling approach: just get latest and compare ID or timestamp?
        // Simpler: Get latest 5, print them if different.
        // Better: store processed IDs.
    } catch (e) { }
}

async function startMonitor() {
    // Initial fetch
    const { data: initData } = await supabase
        .from('cron_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (initData) {
        initData.reverse().forEach(printLog);
        if (initData.length > 0) {
            lastSeenId = initData[initData.length - 1].created_at; // Use timestamp for simpler cursoring/polling if needed, or just IDs.
            // Actually, timestamps are better for > comparisons.
        }
    }

    // Poll every 3 seconds
    setInterval(async () => {
        if (!lastSeenId) return;

        const { data, error } = await supabase
            .from('cron_logs')
            .select('*')
            .gt('created_at', lastSeenId)
            .order('created_at', { ascending: true });

        if (data && data.length > 0) {
            data.forEach(printLog);
            lastSeenId = data[data.length - 1].created_at;
        }
    }, 3000);
}

function printLog(log) {
    const time = new Date(log.created_at).toLocaleTimeString();
    const icon = log.status === 'success' ? '✅' : '❌';
    const type = log.job_type === 'auto' ? '[Auto]' : '[Manual]';
    console.log(`${time} ${icon} ${type} ${log.title || 'No Title'} (${log.keyword})`);
    if (log.status !== 'success') {
        console.log(`   └─ Error: ${log.error_message}`);
    }
}

startMonitor();
