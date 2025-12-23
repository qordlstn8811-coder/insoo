
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/"/g, '');
            process.env[key] = val;
        }
    });
}

import { generatePostAction } from './src/lib/post-generator';

async function runTest() {
    console.log('🚀 Starting Full Generation Test...');
    const start = Date.now();

    try {
        const result = await generatePostAction('manual');
        const duration = (Date.now() - start) / 1000;

        if (result.success) {
            console.log(`\n✅ SUCCESS! (Took ${duration}s)`);
            console.log(`Title: ${result.title}`);
            console.log(`Keyword: ${result.keyword}`);
            console.log(`Image: ${result.imageUrl}`);
        } else {
            console.error(`\n❌ FAILED! (Took ${duration}s)`);
            console.error(`Error: ${result.error}`);
        }

    } catch (error) {
        console.error('\n❌ UNHANDLED EXCEPTION:', error);
    }
}

runTest();
