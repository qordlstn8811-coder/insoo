
import fs from 'fs';
import path from 'path';

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const firstEquals = line.indexOf('=');
        if (firstEquals !== -1) {
            const key = line.substring(0, firstEquals).trim();
            // Value can contain = (e.g. JWT)
            let value = line.substring(firstEquals + 1).trim();

            // Remove wrapping quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            if (key && value) {
                process.env[key] = value;
            }
        }
    });

    // Fallback if keys are still missing (to crash later or pass init)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co';
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy_key';

    const key = process.env.GOOGLE_GEMINI_API_KEY || '';
    console.log(`Loaded API KEY: Length=${key.length}, Preview=${key.substring(0, 5)}...`);

    console.log('Environment loaded.');
} else {
    console.warn('.env.local not found!');
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy_key';
}

async function testListModels(apiKey: string) {
    console.log('--- Listing Available Models ---');
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: 'GET' }
        );
        const data = await response.json();
        if (response.ok && data.models) {
            const modelNames = data.models.map((m: any) => m.name);
            console.log('Total Models:', modelNames.length);
            console.log('Has gemini-1.5-flash:', modelNames.includes('models/gemini-1.5-flash'));
            console.log('Has gemini-1.5-pro:', modelNames.includes('models/gemini-1.5-pro'));
            console.log('--- All Models ---');
            modelNames.forEach((n: string) => console.log(n));
        } else {
            console.error('List Models Error:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('List Models Exception:', e);
    }
    console.log('--------------------------------');
}

async function run() {
    try {
        const key = process.env.GOOGLE_GEMINI_API_KEY || '';
        // await testListModels(key);

        console.log('Starting manual generation test...');
        const { generatePostAction } = await import('./src/lib/post-generator');
        const result = await generatePostAction();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
