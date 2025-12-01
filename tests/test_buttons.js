// Test all buttons and links on the website
// Run from project root: node tests/test_buttons.js

const http = require('http');
const { URL } = require('url');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    // Properly encode the path
    let encodedPath = path;
    if (path.includes('?')) {
      const [basePath, queryString] = path.split('?');
      const params = new URLSearchParams(queryString);
      encodedPath = basePath + '?' + params.toString();
    }
    
    const options = {
      hostname: '127.0.0.1',
      port: 4000,
      path: encodedPath,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 BUTTON AND LINK TEST');
  console.log('='.repeat(60) + '\n');

  const buttons = [
    // Main pages
    { name: 'Home page', path: '/', expectedStatus: 200 },
    { name: 'Categories page (listings.html)', path: '/frontend/listings.html', expectedStatus: 200 },
    { name: 'Add listing page', path: '/frontend/add.html', expectedStatus: 200 },
    { name: 'Auth page (login/register)', path: '/frontend/auth.html', expectedStatus: 200 },
    { name: 'Register page (reg.html)', path: '/frontend/reg.html', expectedStatus: 200 },
    { name: 'Dashboard page', path: '/frontend/dashboard.html', expectedStatus: 200 },
    
    // API endpoints for search/filter
    { name: 'API - Get all listings', path: '/api/listings', expectedStatus: 200 },
    { name: 'API - Search test', path: '/api/listings?q=тест', expectedStatus: 200 },
    
    // Static assets
    { name: 'CSS styles', path: '/css/styles.css', expectedStatus: 200 },
    { name: 'JS auth module', path: '/js/auth.js', expectedStatus: 200 },
    { name: 'JS search module', path: '/js/search.js', expectedStatus: 200 },
    { name: 'Hero video', path: '/img/hero.mp4', expectedStatus: 200 },
  ];

  let passed = 0;
  let failed = 0;

  console.log('Testing all buttons and links...\n');

  for (const btn of buttons) {
    try {
      const result = await testAPI(btn.path);
      const status = result.status;
      const isPass = status === btn.expectedStatus;
      
      if (isPass) {
        console.log(`✅ ${btn.name}`);
        console.log(`   ${btn.path} → ${status}`);
        passed++;
      } else {
        console.log(`❌ ${btn.name}`);
        console.log(`   ${btn.path} → ${status} (expected ${btn.expectedStatus})`);
        failed++;
      }
    } catch (err) {
      console.log(`❌ ${btn.name}`);
      console.log(`   Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ ALL BUTTONS AND LINKS WORKING!');
  } else {
    console.log(`❌ ${failed} issues found`);
  }
  
  console.log('='.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
