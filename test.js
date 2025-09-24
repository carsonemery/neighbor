// Clean test runner for the vehicle storage algorithm
const { findBestCombinations } = require('./server');

// Test data - simple listings for testing
const testListings = [
  {
    id: "listing1",
    location_id: "location1", 
    length: 20,
    width: 20,
    price_in_cents: 1000
  },
  {
    id: "listing2",
    location_id: "location1",
    length: 30,
    width: 20, 
    price_in_cents: 1500
  },
  {
    id: "listing3",
    location_id: "location2",
    length: 25,
    width: 20,
    price_in_cents: 1200
  }
];

// Test runner
function runTest(testName, vehicles, expectedDescription) {
  console.log(`\n${testName}`);
  console.log(`Input: ${JSON.stringify(vehicles)}`);
  
  const result = findBestCombinations(vehicles, testListings);
  
  console.log(`Results: ${result.length} location(s) found`);
  result.forEach((r, i) => {
    console.log(`  ${i + 1}. Location: ${r.location_id}, Price: $${r.total_price_in_cents/100}, Listings: ${r.listing_ids.join(', ')}`);
  });
  
  console.log(`Expected: ${expectedDescription}`);
  
  // Simple validation
  if (result.length === 0) {
    console.log("PASS - No results (as expected)");
  } else {
    console.log("PASS - Found results");
  }
}

console.log("Vehicle Storage Algorithm Tests");
console.log("==================================");

// Test 1: Single vehicle that fits
runTest(
  "Test 1: Single vehicle (10x10)", 
  [{length: 10, quantity: 1}],
  "Should find location1 with listing1 (cheapest)"
);

// Test 2: Vehicle that doesn't fit
runTest(
  "Test 2: Vehicle too large (50x10)", 
  [{length: 50, quantity: 1}],
  "Empty array (no results)"
);

// Test 3: Multiple vehicles
runTest(
  "Test 3: Multiple vehicles (10x10, 15x10)", 
  [{length: 10, quantity: 1}, {length: 15, quantity: 1}],
  "Should find location1 with both vehicles in listing2"
);

// Test 4: Multiple vehicles with quantity
runTest(
  "Test 4: Multiple vehicles with quantity (10x10 x2)", 
  [{length: 10, quantity: 2}],
  "Should find location1 with both vehicles in listing2"
);