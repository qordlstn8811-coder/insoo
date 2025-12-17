const API_KEY = 'AIzaSyBgvewNyf2yAyybqmyHdbAa8lq7fL453U0';

async function listAvailableModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await response.json();

        if (data.models) {
            console.log('=== 사용 가능한 모델 (generateContent 지원) ===\n');

            const workingModels = data.models.filter(model =>
                model.supportedGenerationMethods?.includes('generateContent')
            );

            workingModels.forEach(model => {
                console.log(`✅ ${model.name}`);
            });

            console.log(`\n총 ${workingModels.length}개 모델 사용 가능`);

            // 첫 번째 모델로 테스트
            if (workingModels.length > 0) {
                const testModel = workingModels[0].name;
                console.log(`\n테스트 모델: ${testModel}`);

                const testResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/${testModel}:generateContent?key=${API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: '안녕하세요' }] }]
                        })
                    }
                );

                if (testResponse.ok) {
                    const result = await testResponse.json();
                    console.log('\n✅ 테스트 성공!');
                    console.log('응답:', result.candidates[0].content.parts[0].text.substring(0, 100));
                } else {
                    console.log('\n❌ 테스트 실패:', testResponse.status);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listAvailableModels();
