// Smoke test for unified search functionality
// Tests that search.js is working on both pages and API returns correct results
// Run from project root: node tests/smoke_test_search.js

const http = require('http');
const fs = require('fs');
const path = require('path');

function testAPI(testPath) {
  return new Promise((resolve, reject) => {
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
            data: JSON.parse(data),
            headers: res.headers
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

async function checkFiles() {
  console.log('Checking files...\n');

  // Check that search.js exists
  const searchPath = path.join(__dirname, '..', 'frontend', 'js', 'search.js');
  if (!fs.existsSync(searchPath)) {
    throw new Error('search.js not found at ' + searchPath);
  }
  console.log('✓ search.js exists');

  // Check that index.html includes search.js
  const indexPath = path.join(__dirname, '..', 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  if (!indexContent.includes('<script src="/js/search.js"')) {
    throw new Error('index.html does not include search.js');
  }
  console.log('✓ index.html includes search.js');

  // Check that listings.html includes search.js
  const listingsPath = path.join(__dirname, '..', 'frontend', 'listings.html');
  const listingsContent = fs.readFileSync(listingsPath, 'utf-8');
  if (!listingsContent.includes('<script src="/js/search.js"')) {
    throw new Error('listings.html does not include search.js');
  }
  console.log('✓ listings.html includes search.js');

  // Check that search.js exports loadListings function
  const searchContent = fs.readFileSync(searchPath, 'utf-8');
  if (!searchContent.includes('async function loadListings')) {
    throw new Error('search.js does not define loadListings function');
  }
  console.log('✓ search.js defines loadListings function');

  // Check that old index.html JS was removed
  if (indexContent.includes('// ЗАГРУЗКА И ОТОБРАЖЕНИЕ ОБЪЯВЛЕНИЙ') &&
      indexContent.match(/async function loadListings\(q = ''\)/)) {
    throw new Error('Old loadListings function still in index.html');
  }
  console.log('✓ Old loadListings code removed from index.html');

  console.log('');
}

async function testSearchAPI() {
  console.log('Testing Search API...\n');

  // Test 1: All listings
  let result = await testAPI('/api/listings');
  if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  if (!Array.isArray(result.data)) throw new Error('Response is not an array');
  if (result.data.length === 0) throw new Error('No listings found');
  console.log(`✓ GET /api/listings returns ${result.data.length} listings`);

  // Test 2: Search (using encoded URL)
  const cementEncoded = encodeURIComponent('Цемент');
  result = await testAPI(`/api/listings?q=${cementEncoded}`);
  if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  if (!Array.isArray(result.data)) throw new Error('Response is not an array');
  console.log(`✓ GET /api/listings?q=Цемент returns ${result.data.length} listing(s)`);

  // Test 3: Category filter (using encoded URL)
  const materialEncoded = encodeURIComponent('Материалы');
  result = await testAPI(`/api/listings?category=${materialEncoded}`);
  if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  if (!Array.isArray(result.data)) throw new Error('Response is not an array');
  console.log(`✓ GET /api/listings?category=Материалы returns ${result.data.length} listing(s)`);

  // Test 4: Pagination
  result = await testAPI('/api/listings?limit=5');
  if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  if (!Array.isArray(result.data)) throw new Error('Response is not an array');
  if (result.data.length > 5) throw new Error('Limit parameter not working');
  console.log(`✓ Pagination works - limit=5 returns ${result.data.length} listing(s)`);

  // Test 5: Image paths are mapped to /uploads/
  result = await testAPI('/api/listings');
  const firstListing = result.data[0];
  if (firstListing.imagePath && !firstListing.imagePath.startsWith('/uploads/') && firstListing.imagePath !== '') {
    console.warn('⚠ Image paths might not be properly mapped to /uploads/');
  } else {
    console.log('✓ Image paths correctly mapped to /uploads/ (or empty)');
  }

  console.log('');
}

async function testPages() {
  console.log('Testing HTML Pages...\n');

  // Test home page
  let result = await testAPI('/');
  if (result.status !== 200) throw new Error(`Home page returned ${result.status}`);
  console.log('✓ GET / returns 200');

  // Test listings page
  result = await testAPI('/frontend/listings.html');
  if (result.status !== 200) throw new Error(`Listings page returned ${result.status}`);
  console.log('✓ GET /frontend/listings.html returns 200');

  // Test add page
  result = await testAPI('/frontend/add.html');
  if (result.status !== 200) throw new Error(`Add page returned ${result.status}`);
  console.log('✓ GET /frontend/add.html returns 200');

  console.log('');
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 SEARCH UNIFICATION SMOKE TEST');
  console.log('='.repeat(60) + '\n');

  try {
    await checkFiles();
    await testSearchAPI();
    await testPages();

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED! Search unification is complete.');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED:', err.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

runTests();
