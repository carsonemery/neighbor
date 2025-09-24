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
  2) I realized that I was not modeling the 2D space correctly, and was also directly changing the dimension data of locations after placing a vehicle instead of making copies of it, there were multiple things wrong, and as I tried to 
    test (which I have also never done in javascript) things became challenging

  What I was doing right before I switched my approach and got some help from Claude:
  1) Grouped by location 
  2) Sorted by price
  3) Expanded vehicles by quantity
  4) Attempted to place largest vehicles first 
  
  After doing some more research and getting some help from Claude, I recognized I needed to switch my approach of modeling the space left available after placing a vehicle, and could use a mix of greedy and exhaustive to optimize the algorithm

  2) I use a two-phase approach for finding combinations:
     - Phase 1 (Greedy): Since listings are sorted by price, I first try simple combinations by incrementally adding the cheapest listings up to 10. This often finds the optimal solution quickly without exhaustive searching.
     - Phase 2 (Exhaustive): If the greedy approach doesn't find a valid combination, I fall back to checking all possible combinations using bit masking (power set), but limited to 12 listings max to prevent performance issues.
  
  3) The switch from greedy to exhaustive happens automatically:
     - Greedy runs first because it's fast (max 10 attempts)
     - If greedy finds no valid combination where all vehicles fit, exhaustive search runs as a fallback
     - This hybrid approach balances performance (usually fast) with completeness (guaranteed to find a solution if one exists within the first 12 listings)

The entire project took roughly 7/8 hours including commenting and setuping up the server
