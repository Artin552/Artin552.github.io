// Simple fetch test for search functionality
// Run from project root: node tests/test_api.js

const http = require('http');

function testAPI(testPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://127.0.0.1:4000${testPath}`);
    const options = {
      hostname: '127.0.0.1',
      port: 4000,
      path: testPath,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            error: e.message
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...\n');

  // Test 1: Get all listings
  console.log('1. GET /api/listings');
  let result = await testAPI('/api/listings');
  console.log(`   Status: ${result.status}`);
  console.log(`   Count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);
  if (Array.isArray(result.data) && result.data.length > 0) {
    console.log(`   Sample: "${result.data[0].title}"`);
  }

  // Test 2: Search for cement
  console.log('\n2. GET /api/listings?q=Цемент');
  result = await testAPI('/api/listings?q=%D0%A6%D0%B5%D0%BC%D0%B5%D0%BD%D1%82');
  console.log(`   Status: ${result.status}`);
  console.log(`   Count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);

  // Test 3: Filter by category
  console.log('\n3. GET /api/listings?category=Инструменты');
  result = await testAPI('/api/listings?category=%D0%98%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D1%8B');
  console.log(`   Status: ${result.status}`);
  console.log(`   Count: ${Array.isArray(result.data) ? result.data.length : 'N/A'}`);

  console.log('\nAPI Tests Complete!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
