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

## Implementation 
- I started off trying to implement a 100% greedy approach, essentially grouping listings by location, and trying to fit the largest possible vehicle into the cheapest possible space etc
  To start with my approach, I initially created the base helper functions and code to do this such as the unpacking of the objects, grouping the listings->sorting them, and expanding the vehicle objects.
  I started running into challenges.

  1) Firstly I have never used javascript in this capacity before, so that was probably the biggest challenge, understanding the syntax and things suchn as the difference between "is", "of" and "in" (in foreach loops)
  2) I realized that I was not modeling the 2D space correctly, and was also directly changing the dimension data of locations after placing a vehicle instead of making copies of it 

  What I did right before I switched:
  1) Grouped by location 
  2) Sorted by price
  3) Expanded vehicles by quantity
  4) Attempted to place largest vehicles first 
  
  After testing and realizing parts of my approach were flawed, I decided to completely switch my approach to a mix of 

- I found it challenging to track 