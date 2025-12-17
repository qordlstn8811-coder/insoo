const API_KEY = 'AIzaSyBgvewNyf2yAyybqmyHdbAa8lq7fL453U0';

async function testWithBilling() {
    try {
        console.log('Testing with billing-enabled API key...\n');

        // 정확한 Gemini API 호출
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: '전주 변기막힘에 대한 짧은 블로그 글을 작성해주세요.'
                        }]
                    }]
                })
            }
        );

        console.log('Status:', response.status);
        const data = await response.json();

        if (response.ok && data.candidates) {
            console.log('\n✅ SUCCESS!');
            console.log('Generated text:');
            console.log(data.candidates[0].content.parts[0].text);
        } else {
            console.log('\n❌ FAILED');
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testWithBilling();
