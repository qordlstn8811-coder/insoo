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
      
      if (res.statusCode === 200) {
        console.log('\n🎉 성공! 글이 생성되었습니다. 홈페이지를 확인해보세요.');
      } else {
        console.log('\n⚠️ 실패! 위 에러 메시지를 확인하세요.');
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
