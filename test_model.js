const fs = require('fs');
const https = require('https');
const path = require('path');

try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);

    if (!match) { console.error('Key not found'); process.exit(1); }
    const apiKey = match[1].trim();

    // Testing gemini-2.5-flash (Next Option)
    const model = 'gemini-2.5-flash';
    console.log(`Testing model: ${model}...`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const postData = JSON.stringify({
        contents: [{ parts: [{ text: "Hello, test." }] }]
    });

    const req = https.request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('✅ SUCCESS: gemini-2.5-flash is WORKING!');
                // Check if quota error is present in 200 OK body (sometimes happens)
                if (data.includes('error')) console.log('⚠️ Warning: Content contains error', data);
            } else {
                console.log('❌ FAILURE:', data);
            }
        });
    });

    req.write(postData);
    req.end();

} catch (e) { console.error(e); }
