const listings = require('../listings.json');

// Main handler function for Vercel
module.exports = function handler(req, res) {
  // Handle GET requests
  if (req.method === 'GET') {
    res.json({ 
      message: 'Vehicle Storage Search API is running!',
      endpoints: {
        'POST /': 'Search for vehicle storage'
      }
    });
    return;
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const vehicles = req.body;
      
      // Validate input
      if (!Array.isArray(vehicles)) {
        return res.status(400).json({ error: 'Request body must be an array' });
      }
      
      const results = findBestCombinations(vehicles, listings);
      res.json(results);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ error: 'Method not allowed' });
}

// Function that orchestratest the search algorithm
function findBestCombinations(vehicles, listings) {
  const expandedVehicles = expandVehicles(vehicles);
  const listingsByLocation = groupListingByLocation(listings);
  const results = [];

  console.log(`Searching for placement of ${expandedVehicles.length} vehicles across ${Object.keys(listingsByLocation).length} locations...`);

  // For each location, try to find valid combinations
  let locationsChecked = 0;
  for (const locationId in listingsByLocation) {
    const locationListings = listingsByLocation[locationId];
    locationsChecked++;
    
    if (locationsChecked % 100 === 0) {
      console.log(`Checked ${locationsChecked} locations...`);
    }
    
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

  console.log(`Found ${results.length} valid locations out of ${locationsChecked} checked`);

  
  // Sort results by price (cheapest first)
  results.sort((a, b) => a.total_price_in_cents - b.total_price_in_cents);
  
  return results;
}

// Find the cheapest combination of listings that can fit all vehicles
function findCheapestValidCombination(vehicles, locationListings) {
  
  
  for (let size = 1; size <= Math.min(locationListings.length, 10); size++) {
    const combination = locationListings.slice(0, size);
    
    if (canFitAllVehicles(vehicles, combination)) {
      const totalPrice = combination.reduce((sum, l) => sum + l.price_in_cents, 0);
      return {
        listing_ids: combination.map(l => l.id),
        total_price: totalPrice
      }
    }
  }
  // If simple approach didn't work, do exhaustive search for remaining listings
  // but limit to reasonable number to prevent hanging
  const maxListings = Math.min(locationListings.length, 12);
  return findCheapestValidCombinationExhaustive(vehicles, locationListings.slice(0, maxListings));
}

// Fallback exhaustive search for complex cases
function findCheapestValidCombinationExhaustive(vehicles, locationListings) {
  let bestCombination = null;
  let bestPrice = Infinity;
  
  const numCombinations = Math.pow(2, locationListings.length);
  
  // Start from 1 to skip empty combination
  for (let i = 1; i < numCombinations; i++) {
    const combination = [];
    let totalPrice = 0;
    
    // Build combination based on binary representation of i
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

// Try to place a vehicle in a given space
function tryPlaceVehicle(vehicle, space) {
  // Check basic fit 
  if (!vehicleFitsInListing(vehicle, space)) {
    return false;
  }
  
  // Calculate how many 10 foot wide strips we have
  const numStrips = Math.floor(space.width / 10);

  // Find a strip with enough room 
  for (let stripIndex = 0; stripIndex < numStrips; stripIndex++) {
    const usedInStrip = space.usedStrips[stripIndex] || 0;
    const remainingLength = space.length - usedInStrip;

    if (remainingLength >= vehicle.length) {
      // Place vehicle in this strip 
      space.usedStrips[stripIndex] = usedInStrip + vehicle.length;
      return true;
    }
  }
  return false;
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

// Export for testing
module.exports.findBestCombinations = findBestCombinations;
