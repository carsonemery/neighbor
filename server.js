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

// Your algorithm function - implement this!
function findBestCombinations(vehicles, listings) {
  // TODO: Implement the bin packing algorithm



  // For now, return empty array
  return [];
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test with: curl -X POST http://localhost:${PORT}/ -H "Content-Type: application/json" -d '[{"length": 10, "quantity": 1}]'`);
});

module.exports = app;
