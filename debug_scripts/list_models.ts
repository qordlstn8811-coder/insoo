
import fs from 'fs';
import path from 'path';

async function listModels() {
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => console.log(`- ${m.name}`));
        } else {
            console.error("No models found or error:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listModels();
