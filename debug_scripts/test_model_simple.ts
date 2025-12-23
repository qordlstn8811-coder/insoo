
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

async function test() {
    // Manually load env
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

    const key = process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
        console.error("No API KEY found");
        return;
    }
    console.log("Key found:", key.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e.message);
    }
}

test();
