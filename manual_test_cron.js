const https = require('https');

// 설정값 (직접 수정해서 쓰세요)
const DOMAIN = 'www.xn--2e0bm8utzck3fsyi7rvktd.com'; // 퓨니코드 도메인
const CRON_SECRET = 'my_secure_password_2025'; // .github/workflows/cron.yml에 설정한 것과 같아야 함

const options = {
  hostname: DOMAIN,
  port: 443,
  path: '/api/cron?limit=1', // 1개만 생성 시도
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${CRON_SECRET}`
  }
};

console.log(`📡 Connecting to https://${DOMAIN}/api/cron ...`);

const req = https.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      console.log('📄 Response Body:');
      console.log(JSON.parse(data));
      const body = JSON.parse(data);

      if (res.statusCode === 200 && body.generated > 0) {
        console.log('\n🎉 진짜 성공! 글이 1개 생성되었습니다. (generated: 1 확인됨)');
      } else {
        console.log('\n⚠️ 실패! (사이트 연결은 됐지만, 글이 안 써졌습니다)');
        console.log(`원인: ${JSON.stringify(body.details)}`);
      }
    } catch (e) {
      console.log('Raw Output:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Connection Error: ${e.message}`);
  console.log('💡 팁: 도메인 DNS가 아직 전파되지 않아서 그럴 수 있습니다.');
});

req.end();
