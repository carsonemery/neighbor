const express = require('express');
const listings = require('./listings.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vehicle Storage Search API is running!',
    endpoints: {
      'POST /': 'Search for vehicle storage'
    }
  });
});

// Main search endpoint
app.post('/', (req, res) => {
  try {
    const vehicles = req.body;
    
    // Validate input
    if (!Array.isArray(vehicles)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }
    
    // For now return a placeholder respose
    const results = findBestCombinations(vehicles, listings);
    
    res.json(results);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function findBestCombinations(vehicles, listings) {
  const expandedVehicles = expandVehicles(vehicles);
  const listingsByLocation = groupListingByLocation(listings);
  const results = [];

  // For each location, try to find valid combinations
  for (const locationId in listingsByLocation) {
    const locationListings = listingsByLocation[locationId];

    // Find the cheapest valid combination for this location 
    const cheapestValid = findCheapestValidCombination(
      expandedVehicles,
      locationListings
    );

    if (cheapestValid) {
      results.push({
        location_id: locationId,
        listing_ids: cheapestValid.listing_ids,
        total_price_in_cents: cheapestValid.total_price
      });
    }
  }  
  
  // Sort results by price (cheapest first)
  results.sort((a, b) => a.total_price_in_cents - b.total_price_in_cents);
  
  return results;
}

// Find the cheapest combination of listings that can fit all vehicles
function findCheapestValidCombination(vehicles, locationListings) {
  let bestCombination = null;
  let bestPrice = Infinity;
  
  // Try all possible combinations of listings
  // This is 2^n where n is number of listings at this location
  const numCombinations = Math.pow(2, locationListings.length);
  
  // Start from 1 to skip empty combination
  for (let i = 1; i < numCombinations; i++) {
    const combination = [];
    let totalPrice = 0;
    
    // Build combination based on binary representation of i
    // If bit j is set in i, include listing j
    for (let j = 0; j < locationListings.length; j++) {
      if (i & (1 << j)) {
        combination.push(locationListings[j]);
        totalPrice += locationListings[j].price_in_cents;
      }
    }
    
    // Skip if already more expensive than best found
    if (totalPrice >= bestPrice) continue;
    
    // Check if all vehicles fit in this combination
    if (canFitAllVehicles(vehicles, combination)) {
      bestCombination = {
        listing_ids: combination.map(l => l.id),
        total_price: totalPrice
      };
      bestPrice = totalPrice;
    }
  }
  return bestCombination;
}


// Check if all vehicles can fit in the given listings 
function canFitAllVehicles(vehicles, listingsToUse) {
  // Create a copy of listings with available space
  const availableSpaces = listingsToUse.map(listing => ({
    id: listing.id,
    length: listing.length,
    width: listing.width,
    usedStrips: [] // Track how much of each 10-foot strip is used
  }));

  // Try to place each vehicle
  for (const vehicle of vehicles) {
    let placed = false;

    // Try to palce in each available space
    for (const space of availableSpaces) {
      if (tryPlaceVehicle(vehicle, space)) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      return false; // Couldn't place this vehicle
    }
  }
  return true; // All vehicles passed
}


/// Helpers

function vehicleFitsInListing(currentVehicle, listing) {
  return currentVehicle.length <= listing.length && 
         currentVehicle.width <= listing.width;
}


// Helper method to group all listings to a location 
// should look like dictionary, where the location id is a unique key 
// and the vaue is an array of listing objects
function groupListingByLocation(listings) {
  // Group listings by location_id
  const listingsByLocation = {};
  
  // For each listing check if the location id is a key, 
  // if its not create an array, fill the arrays at each key
  // with listing objects
  for (const listing of listings) {
    const locationId = listing.location_id;
    
    if (!listingsByLocation[locationId]) {
      listingsByLocation[locationId] = [];
    }
    
    listingsByLocation[locationId].push(listing);
  }
  // Sort each locations listings by price (cheapest first)
  for (const locationId in listingsByLocation) {
    listingsByLocation[locationId].sort((a, b) => a.price_in_cents - b.price_in_cents);
  }

  return listingsByLocation;

}

// helper function for creating vehicle objects from the input and sorting them
function expandVehicles(vehicles) {
  const expandedVehicles = [];
  
  for (const vehicle of vehicles) {
    for (let i = 0; i < vehicle.quantity; i++) {
      expandedVehicles.push({
        length: vehicle.length,
        width: 10  // Always 10 feet
      });
    }
  }

  // Sort by area (largest first)
  expandedVehicles.sort((a, b) => (b.length * b.width) - (a.length * a.width)); 
  
  return expandedVehicles;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/ -H "Content-Type: application/json" -d '[{"length": 10, "quantity": 1}]'`);
});

module.exports = { app, findBestCombinations };
