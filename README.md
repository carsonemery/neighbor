# Vehicle Storage Search API

A Node.js + Express API for finding optimal vehicle storage solutions.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Test the API:
```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '[{"length": 10, "quantity": 1}]'
```

## API Endpoints

- `GET /` - Health check
- `POST /` - Search for vehicle storage

## Deployment

This project is ready to deploy to Vercel, Railway, or Heroku.
