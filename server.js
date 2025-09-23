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

  const listingsByLocation = groupListingByLocation(listings);
  const expandedVehicles = expandedVehicles(vehicles);
  const results = [];

  // for each location try to fit all vehicles
  for (const locationId in listingsByLocation) {
    const locationListings = listingsByLocation[locationId];

    const result = tryFitVehiclesAtLocation(expandedVehicles, locationListings);

      if (result) {
        results.push({
          location_id: locationId,
          listing_ids: result.map(listing => listing.id),
          total_price_in_cents: totalCost
        });
      }
    
    }
  return result;
}


// Recursive helper method that tried to fit multiple vehicles per space 
function tryFitVehiclesAtLocation(vehicles, locationListings) {
  // Try to fit all vehicles recursively
  const result = fitVehiclesRecursively(vehicles, locationListings, []);
  return result ? result.map(r => r.listing) : null;
}

function fitVehiclesRecursively(remainingVehicles, availableListings, usedListings) {
  // Base case: no more vehicles to place
  if (remainingVehicles.length === 0) {
    return usedListings; // Success!
  }
  
  const currentVehicle = remainingVehicles[0];
  const otherVehicles = remainingVehicles.slice(1);
  
  // Try each available listing
  for (const listing of availableListings) {
    if (vehicleFitsInListing(currentVehicle, listing)) {
      // Check if we can use this listing
      const existingUsage = usedListings.find(u => u.listing.id === listing.id);
      
      if (!existingUsage) {
        // New listing - create usage record
        const newUsage = {
          listing: listing,
          remainingLength: listing.length - currentVehicle.length,
          remainingWidth: listing.width - currentVehicle.width
        };
        
        // Recursively try to fit remaining vehicles
        const result = fitVehiclesRecursively(otherVehicles, availableListings, [...usedListings, newUsage]);
        if (result) return result; // Success!
        
      } else {
        // Existing listing - check if vehicle fits in remaining space
        if (currentVehicle.length <= existingUsage.remainingLength && 
            currentVehicle.width <= existingUsage.remainingWidth) {
          
          // Create updated usage
          const updatedUsage = {
            ...existingUsage,
            remainingLength: existingUsage.remainingLength - currentVehicle.length,
            remainingWidth: existingUsage.remainingWidth - currentVehicle.width
          };
          
          // Update the usedListings array
          const updatedUsedListings = usedListings.map(u => 
            u.listing.id === listing.id ? updatedUsage : u
          );
          
          // Recursively try to fit remaining vehicles
          const result = fitVehiclesRecursively(otherVehicles, availableListings, updatedUsedListings);
          if (result) return result; // Success!
        }
      }
    }
  }
  
  return null; // Can't fit this vehicle anywhere
}


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

module.exports = app;
