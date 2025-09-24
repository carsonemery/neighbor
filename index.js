// Main entrypoint for local development
const express = require('express');
const apiHandler = require('./api/index.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API routes
app.all('/api', apiHandler);
app.all('/api/*', apiHandler);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Vehicle Storage Search API',
    api_endpoint: '/api',
    status: 'running'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
    console.log(`Test with: curl -X POST http://localhost:${PORT}/api -H "Content-Type: application/json" -d '[{"length": 10, "quantity": 1}]'`);
  });
}

module.exports = app;
