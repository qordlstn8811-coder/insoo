
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('Main started...');

    // Load env vars manually
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let val = parts.slice(1).join('=').trim();
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                process.env[key] = val;
            }
        });
        console.log('Env loaded manually.');
    } else {
        console.log('.env.local not found');
    }

    console.log('GEMINI_KEY prefix:', process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 5));

    // Dynamic import to ensure API_KEY is read AFTER env is loaded
    // Using require because imports are hoisted
    const { generatePostAction } = require('./src/lib/post-generator');

    console.log('Calling generatePostAction...');
    try {
        const result = await generatePostAction('manual');
        console.log('Result:', result);
    } catch (error) {
        console.error('Error in main:', error);
    }
}

main();
