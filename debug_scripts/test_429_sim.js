/**
 * 429 에러 재시도 로직 검증용 시뮬레이터
 * post-generator.ts의 fetchWithRetry 로직과 유사한 흐름을 테스트합니다.
 */

async function mockFetchWithRetry(maxRetries = 3) {
    console.log('--- 429 재시도 로직 시뮬레이션 시작 ---');

    for (let i = 0; i < maxRetries; i++) {
        const attempt = i + 1;
        // 시뮬레이션: 항상 429를 반환하지만 마지막 시도에서는 성공한다고 가정
        const statusCode = (attempt < maxRetries) ? 429 : 200;

        console.log(`[ATTEMPT ${attempt}] Status Code: ${statusCode}`);

        if (statusCode === 429 && i < maxRetries - 1) {
            const backoffTime = Math.pow(2, i + 1) * 1000;
            const jitter = Math.random() * 500; // 테스트용 지터 축소
            const waitTime = backoffTime + jitter;

            console.log(`>> [WAIT] 429 감지됨. ${Math.round(waitTime)}ms 대기 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
        }

        if (statusCode === 200) {
            console.log('✅ [SUCCESS] 재시도 끝에 성공했습니다!');
            return true;
        }
    }
    console.error('❌ [FAILURE] 최대 재시도 횟수 초과');
    return false;
}

mockFetchWithRetry();
