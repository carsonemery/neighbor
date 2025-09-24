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

  // for each location try to fit all vehicles
  for (const locationId in listingsByLocation) {
    const locationListings = listingsByLocation[locationId];
    const placedVehicles = new Set();
    const usedListings = [];

    // one vehicle at a time, try to place the vehicle in all of the possible listings
    // at a location
    for (const vehicle of expandedVehicles) {
      if (placedVehicles.has(vehicle)) continue; // Skip if already placed
      let placed = false;

      // Try placing each vehicle at at each listing
      for (const listing of locationListings) {
        if (vehicleFitsInListing(vehicle, listing)) {
          // Place the vehicle and update the dimensions 
          listing.length = listing.length - vehicle.length;
          listing.width = listing.width - vehicle.width;

          if (!usedListings.includes(listing)) {
            usedListings.push(listing);
          }

          placedVehicles.add(vehicle);
          placed = true;
          break;
          }
        }
      if (!placed) break; // Cant place this vehicle
    }

    // If all vehicles placed, add to results
    if (placedVehicles.size === expandedVehicles.length) {
      const totalCost = usedListings.reduce((sum, listing) => sum + listing.price_in_cents, 0);
      results.push({
        location_id: locationId,
        listing_ids: usedListings.map(listing => listing.id),
        total_price_in_cents: totalCost
      });
    }
  }
  return results;
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
