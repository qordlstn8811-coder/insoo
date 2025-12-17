const API_KEY = 'AIzaSyDzIf_1cXIrldBE9ZExQkvVWPc4XVOpv4Q';

async function testGemini() {
    try {
        console.log('Testing Gemini API with correct code...\n');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: '안녕하세요, 간단한 테스트입니다.' }]
                    }]
                })
            }
        );

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.candidates) {
            console.log('\n✅ SUCCESS! Generated text:');
            console.log(data.candidates[0].content.parts[0].text);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testGemini();
