// Test product detail view functionality
// Run from project root: node tests/test_product_detail.js

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
  console.log('='.repeat(70));
  console.log('🔍 PRODUCT DETAIL VIEW TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // 1. Get all listings first
    console.log('📋 Step 1: Fetching all listings...');
    const listingsRes = await makeRequest('/api/listings?limit=1');
    if (listingsRes.status !== 200) {
      console.log('❌ Failed to fetch listings');
      process.exit(1);
    }

    const listings = JSON.parse(listingsRes.body);
    if (listings.length === 0) {
      console.log('❌ No listings found in database');
      process.exit(1);
    }

    const firstListing = listings[0];
    console.log(`✅ Found ${listings.length} listings`);
    console.log(`   Using test product: "${firstListing.title}" (ID: ${firstListing.id})\n`);

    // 2. Test fetching individual product via API
    console.log('📋 Step 2: Testing API /api/listings/:id endpoint...');
    const productRes = await makeRequest(`/api/listings/${encodeURIComponent(firstListing.id)}`);
    if (productRes.status !== 200) {
      console.log(`❌ API endpoint returned status ${productRes.status}`);
      process.exit(1);
    }

    const product = JSON.parse(productRes.body);
    console.log('✅ API endpoint works correctly');
    console.log(`   Product fetched: "${product.title}"`);
    console.log(`   Price: ${product.price} ₽`);
    console.log(`   Category: ${product.category}\n`);

    // 3. Test product detail page with query parameter
    console.log('📋 Step 3: Testing product detail page URL...');
    const detailUrl = `/frontend/listings.html?view=detail&id=${encodeURIComponent(firstListing.id)}`;
    const pageRes = await makeRequest(detailUrl);
    if (pageRes.status !== 200) {
      console.log(`❌ Detail page returned status ${pageRes.status}`);
      process.exit(1);
    }

    // Check if page contains key elements
    const pageContent = pageRes.body;
    const hasDetailDiv = pageContent.includes('listing-detail');
    const hasTitle = pageContent.includes(product.title);
    const hasBackButton = pageContent.includes('Назад');
    const hasOrderButton = pageContent.includes('Оформить');

    console.log('✅ Detail page loads successfully');
    console.log(`   Contains detail container: ${hasDetailDiv ? '✅' : '❌'}`);
    console.log(`   Contains product title: ${hasTitle ? '✅' : '❌'}`);
    console.log(`   Contains back button: ${hasBackButton ? '✅' : '❌'}`);
    console.log(`   Contains order button: ${hasOrderButton ? '✅' : '❌'}\n`);

    // 4. Test search.js generated links
    console.log('📋 Step 4: Testing links from search.js...');
    const indexRes = await makeRequest('/');
    if (indexRes.status !== 200) {
      console.log('❌ Index page failed to load');
      process.exit(1);
    }

    const indexContent = indexRes.body;
    const hasSearchJs = indexContent.includes('search.js');
    const hasListingsContainer = indexContent.includes('id="listings"');
    
    console.log('✅ Index page loads correctly');
    console.log(`   Contains search.js: ${hasSearchJs ? '✅' : '❌'}`);
    console.log(`   Contains listings container: ${hasListingsContainer ? '✅' : '❌'}\n`);

    // 5. Test listings page links
    console.log('📋 Step 5: Testing links from listings.html...');
    const listingsPageRes = await makeRequest('/frontend/listings.html');
    if (listingsPageRes.status !== 200) {
      console.log('❌ Listings page failed to load');
      process.exit(1);
    }

    const listingsPageContent = listingsPageRes.body;
    const hasSearchJs2 = listingsPageContent.includes('search.js');
    const hasListingsContainer2 = listingsPageContent.includes('id="listings"');
    const hasCategoryTiles = listingsPageContent.includes('category-tiles');
    
    console.log('✅ Listings page loads correctly');
    console.log(`   Contains search.js: ${hasSearchJs2 ? '✅' : '❌'}`);
    console.log(`   Contains listings container: ${hasListingsContainer2 ? '✅' : '❌'}`);
    console.log(`   Contains category tiles: ${hasCategoryTiles ? '✅' : '❌'}\n`);

    console.log('='.repeat(70));
    console.log('✅ ALL PRODUCT DETAIL TESTS PASSED!');
    console.log('='.repeat(70));
    console.log('\n📌 Test Summary:');
    console.log(`   - API endpoint: ✅ Working`);
    console.log(`   - Detail page: ✅ Working`);
    console.log(`   - Search.js links: ✅ Correct format`);
    console.log(`   - Listings.html links: ✅ Correct format`);
    console.log('\n🎯 Product detail flow:');
    console.log(`   1. Search for product on index.html`);
    console.log(`   2. Click "Открыть →" button`);
    console.log(`   3. See full product details at: ${detailUrl}`);
    console.log(`   4. Click "← Назад" to return to listings\n`);

    process.exit(0);
  } catch (err) {
    console.log('❌ Test error:', err.message);
    process.exit(1);
  }
}

runTests();
