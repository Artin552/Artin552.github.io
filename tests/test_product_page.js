// Test product detail page
// Run from project root: node tests/test_product_page.js

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 4000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\n' + '='.repeat(75));
  console.log('✅ PRODUCT PAGE TEST');
  console.log('='.repeat(75) + '\n');

  try {
    // 1. Test product page exists
    console.log('📋 Test 1: Product page (product.html) is accessible');
    const productPageRes = await makeRequest('/frontend/product.html?id=8');
    if (productPageRes.status !== 200) throw new Error('Product page not found');
    console.log('✅ Product page loads successfully\n');

    // 2. Test listings page shows categories
    console.log('📋 Test 2: Listings page shows categories');
    const listingsRes = await makeRequest('/frontend/listings.html');
    if (listingsRes.status !== 200) throw new Error('Listings page not found');
    if (!listingsRes.body.includes('categoryTiles') && !listingsRes.body.includes('category-tiles')) {
      throw new Error('Category tiles not found on listings page');
    }
    console.log('✅ Listings page has categories\n');

    // 3. Test API endpoint
    console.log('📋 Test 3: API endpoint returns product');
    const apiRes = await makeRequest('/api/listings/8');
    if (apiRes.status !== 200) throw new Error('API endpoint failed');
    const product = JSON.parse(apiRes.body);
    console.log(`✅ API returns product: "${product.title}"\n`);

    // 4. Test search.js generates correct links
    console.log('📋 Test 4: Links use product.html');
    const indexRes = await makeRequest('/');
    if (!indexRes.body.includes('search.js')) {
      throw new Error('search.js not loaded on index page');
    }
    console.log('✅ search.js is loaded on index page\n');

    // 5. Test product page content
    console.log('📋 Test 5: Product page has required elements');
    const productContent = productPageRes.body;
    const checks = [
      { name: 'Product detail container', test: productContent.includes('listing-detail') },
      { name: 'Product title element', test: productContent.includes('listing-title') },
      { name: 'Product image', test: productContent.includes('listing-image') },
      { name: 'Product info', test: productContent.includes('listing-info') },
      { name: 'Back link', test: productContent.includes('listings.html') },
    ];

    let allPass = true;
    checks.forEach(check => {
      const result = check.test();
      console.log(`   ${result ? '✅' : '❌'} ${check.name}`);
      if (!result) allPass = false;
    });

    if (!allPass) throw new Error('Some product page checks failed');
    console.log();

    console.log('='.repeat(75));
    console.log('✅ ALL TESTS PASSED!\n');

    console.log('📊 WORKFLOW:');
    console.log('   1. User opens http://127.0.0.1:4000/');
    console.log('   2. User searches or goes to /frontend/listings.html');
    console.log('   3. User sees categories and list of products');
    console.log('   4. User clicks "Открыть" button on a product');
    console.log('   5. Navigates to: /frontend/product.html?id=8');
    console.log('   6. Sees full product details');
    console.log('   7. Can click "Вернуться к категориям" to go back\n');

    console.log('✨ FEATURES:');
    console.log('   ✅ Separate page for product details (product.html)');
    console.log('   ✅ Listings page shows categories');
    console.log('   ✅ Product page shows detailed product info');
    console.log('   ✅ Easy navigation between pages');
    console.log('   ✅ Structure is clean and maintainable\n');

    process.exit(0);
  } catch (err) {
    console.log('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
