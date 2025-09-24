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



## implementation and thoughts
could start by sorting the litings at a unique location from cheapest to most expensive, and trying to place the largest vehicles in the cheapest listing  

this might mean we are ignoring cases where two or more vehicles could fit perfectly into a listing, I'll start with this greedy approach

optimization, in the recursive method, I could later loops