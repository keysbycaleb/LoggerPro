
# Theme Park Pro - The Greatest Roller Coaster Log App

This project is building the ultimate roller coaster logging application.

## Part 1: The Foundational Concept - A User's "Rating DNA"

We are not just collecting ratings; we are building a dynamic profile of a user's unique taste, their personal "Rating DNA." This DNA is defined once and then applied to every ride they log. It's composed of two parts: the criteria they care about and the weight (importance) they assign to each. This DNA can evolve, and the app must intelligently reflect those changes across their entire logbook.

## Part 2: The Data Structures - Where the Numbers Live

To execute the math, we need to be precise about where the data is stored in Firestore.

### A. The User's Profile Document (The DNA Source)

This document, located at `/users/{userUID}`, is the single source of truth for a user's current preferences. It will contain a specific field:

`ratingPreferences`: An array of objects. Each object represents a single criterion the user has chosen and weighted.

Here is the exact TypeScript interface for the objects within this array:

```typescript
interface RatingPreference {
  id: string;          // A unique identifier, e.g., 'airtime', 'theming'
  label: string;       // The display name, e.g., 'Airtime', 'Theming'
  weight: number;      // The user-defined importance, as a percentage (e.g., 50 for 50%)
}
```

Example `ratingPreferences` field in Firestore:

```json
"ratingPreferences": [
  { "id": "airtime", "label": "Airtime", "weight": 50 },
  { "id": "thrill", "label": "Thrill", "weight": 30 },
  { "id": "theming", "label": "Theming", "weight": 10 },
  { "id": "pacing", "label": "Pacing", "weight": 5 },
  { "id": "smoothness", "label": "Smoothness", "weight": 5 }
]
```

### B. The Ride Log Document (The Historical Snapshot)

This document, located at `/users/{userUID}/rideLogs/{logID}`, is an immutable record of a single ride experience. It stores a snapshot of both the user's ratings and their preferences at the time of logging.

`overallRating`: The final calculated "Score at the Time."

`ratedCriteria`: An array of objects. This looks similar to the preferences, but crucially includes the 1-10 rating the user gave for that specific ride.

Here is the exact TypeScript interface for the objects within this array:

```typescript
interface RatedCriterion {
  id: string;          // e.g., 'airtime'
  label: string;       // e.g., 'Airtime'
  weight: number;      // The weight used for the calculation (e.g., 50)
  rating: number;      // The user's 1-10 score for this criterion on this ride (e.g., 7)
}
```

## Part 3: The Core Mathematical Equation

The entire system revolves around a single, powerful weighted average formula:

**Overall Score = Σ (Rating_i × (Weight_i / 100))**

## Part 4: The Logistical Triggers - When and Where the Math Happens

The same core equation is used in three distinct scenarios:

*   **Scenario A: Saving a New Ride Log**
*   **Scenario B: Viewing a Ride Detail Screen**
*   **Scenario C: Sorting the Logbook by "Current Score"**

## Firebase Integration

### Saving Lists of Data

To generate a unique, timestamp-based key for every child added to a Firebase database reference we can send a `POST` request. For our `users` path, it made sense to define our own keys since each user has a unique username. But when users add blog posts to the app, we'll use a `POST` request to auto-generate a key for each blog post:

```
curl -X POST -d '{
  "author": "alanisawesome",
  "title": "The Turing Machine"
}' 'https://docs-examples.firebaseio.com/fireblog/posts.json'
```

Our `posts` path now has the following data:

```json
{
  "posts": {
    "-JSOpn9ZC54A4P4RoqVa": {
      "author": "alanisawesome",
      "title": "The Turing Machine"
    }
  }
}
```

Notice that the key `-JSOpn9ZC54A4P4RoqVa` was automatically generated for us because we used a `POST` request. A successful request will be indicated by a `200 OK` HTTP status code, and the response will contain the key of the new data that was added:

```json
{"name":"-JSOpn9ZC54A4P4RoqVa"}
```
