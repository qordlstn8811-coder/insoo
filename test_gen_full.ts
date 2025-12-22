
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

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
