const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyBgvewNyf2yAyybqmyHdbAa8lq7fL453U0';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModels() {
    console.log('Testing Gemini models...\n');

    const modelsToTest = [
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'models/gemini-pro',
        'models/gemini-1.5-pro'
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello');
            const text = result.response.text();
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`Response: ${text.substring(0, 50)}...\n`);
            break; // 성공하면 중단
        } catch (error) {
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`Error: ${error.message}\n`);
        }
    }
}

testModels();
