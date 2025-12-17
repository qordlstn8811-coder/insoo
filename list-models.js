const API_KEY = 'AIzaSyAyCdB8TjL2EvA_MnFrJj6Ud2CtBIx2xBg';

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );

        const data = await response.json();
        console.log('Available models:');
        console.log(JSON.stringify(data, null, 2));

        if (data.models) {
            console.log('\n=== Models that support generateContent ===');
            data.models.forEach(model => {
                if (model.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`✅ ${model.name}`);
                }
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
