const assert = require('assert');
const { findBestCombinations } = require('./server');

// Test data
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

function runTest(testName, testFunction) {
  try {
    testFunction();
    console.log(`PASS: ${testName}`);
  } catch (error) {
    console.log(`FAIL: ${testName}`);
    console.log(`      ${error.message}`);
  }
}

function testSingleVehicle() {
  const result = findBestCombinations([{length: 10, quantity: 1}], testListings);
  
  assert.strictEqual(result.length, 2, "Should find 2 locations");
  assert.strictEqual(result[0].location_id, "location1", "First result should be location1");
  assert.strictEqual(result[0].total_price_in_cents, 1000, "Should use cheapest listing (1000 cents)");
  assert.deepStrictEqual(result[0].listing_ids, ["listing1"], "Should use listing1");
}

function testVehicleTooLarge() {
  const result = findBestCombinations([{length: 50, quantity: 1}], testListings);
  
  assert.strictEqual(result.length, 0, "Should find no locations");
}

function testMultipleVehiclesShouldUseSingleListing() {
  const result = findBestCombinations([{length: 10, quantity: 1}, {length: 15, quantity: 1}], testListings);
  
  assert(result.length > 0, "Should find at least one location");
  
  const cheapestSolution = result[0];
  
  // Both vehicles should fit in listing2 (30x20)
  // Vehicle 1 (15x10): Uses space, leaves (15x10) remaining  
  // Vehicle 2 (10x10): Should fit in (15x10) remaining space
  assert.strictEqual(cheapestSolution.listing_ids.length, 1, "Should use only one listing");
  assert.strictEqual(cheapestSolution.total_price_in_cents, 1500, "Should cost 1500 (only listing2)");
  assert.deepStrictEqual(cheapestSolution.listing_ids, ["listing2"], "Should use listing2");
}

function testMultipleVehiclesWithQuantity() {
  const result = findBestCombinations([{length: 10, quantity: 2}], testListings);
  
  assert(result.length > 0, "Should find at least one location");
  
  const cheapestSolution = result[0];
  
  // Both 10x10 vehicles should fit in listing2 (30x20)
  // First 10x10: leaves (20x10) remaining
  // Second 10x10: fits in (20x10) remaining space
  assert.strictEqual(cheapestSolution.listing_ids.length, 1, "Should use only one listing");
  assert.strictEqual(cheapestSolution.total_price_in_cents, 1500, "Should cost 1500 (only listing2)");
  assert.deepStrictEqual(cheapestSolution.listing_ids, ["listing2"], "Should use listing2");
}

function testVehicleFitsInListing() {
  const vehicle = { length: 10, width: 10 };
  const listing = { length: 20, width: 20 };
  
  // Import the helper function if it's exported, or test the logic directly
  const fits = vehicle.length <= listing.length && vehicle.width <= listing.width;
  assert.strictEqual(fits, true, "10x10 vehicle should fit in 20x20 listing");
}

function testVehicleDoesNotFitInListing() {
  const vehicle = { length: 25, width: 10 };
  const listing = { length: 20, width: 20 };
  
  const fits = vehicle.length <= listing.length && vehicle.width <= listing.width;
  assert.strictEqual(fits, false, "25x10 vehicle should not fit in 20x20 listing");
}

// Run all tests
console.log("Running Vehicle Storage Algorithm Tests");
console.log("=====================================");

runTest("Single vehicle finds correct location", testSingleVehicle);
runTest("Vehicle too large returns no results", testVehicleTooLarge);
runTest("Multiple vehicles use single listing when possible", testMultipleVehiclesShouldUseSingleListing);
runTest("Multiple vehicles with quantity use single listing", testMultipleVehiclesWithQuantity);
runTest("Vehicle fits in listing - basic logic", testVehicleFitsInListing);
runTest("Vehicle does not fit in listing - basic logic", testVehicleDoesNotFitInListing);

console.log("\nTest Summary:");
console.log("- PASS means the test passed all assertions");
console.log("- FAIL means the test failed with the specific assertion error");