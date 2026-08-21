# ParkRadar

ParkRadar is a lightweight AI-assisted web application that helps users in the UK find nearby streets with a higher estimated likelihood of free parking.

Users enter a UK postcode and select a search radius. The app converts the postcode into coordinates, fetches nearby street candidates using Geoapify, ranks them using Gemini AI, and returns a responsive card-based list with Google Maps and Waze navigation links.

Live demo: https://parkradar.vercel.app

---

## Project Status

ParkRadar is a hobby MVP project.

It is not a real-time parking availability system and does not provide legal parking advice. It estimates likely street parking opportunities based on nearby street/address data and AI-assisted reasoning.

Always check local signs, permit rules, payment zones, and parking restrictions before parking.

---

## Features

- UK postcode search
- Adjustable search radius
- Live responsive radius slider
- Nearby street search using Geoapify
- AI-assisted parking likelihood ranking using Gemini
- Fallback ranking if Gemini is unavailable
- Google Maps navigation links
- Waze navigation links
- Responsive Web3-inspired UI
- Datadog RUM monitoring
- Vercel deployment
- GitHub-based CI/CD

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Node.js runtime
- TypeScript

### External APIs

- Postcodes.io
- Geoapify Geocoding API
- Google Gemini API
- Google Maps links
- Waze links

### Deployment and Observability

- Vercel
- GitHub
- GitHub Actions
- Datadog Real User Monitoring

---

## High-Level Architecture

```text
User
 ↓
Next.js Frontend
 ↓
/api/search
 ↓
Postcodes.io
 ↓
Geoapify street/address search
 ↓
Gemini AI ranking
 ↓
Ranked parking results
 ↓
Google Maps / Waze navigation
```

---

## User Flow

```text
1. User enters a UK postcode
2. User selects a radius
3. User clicks "Find Parking"
4. Backend validates the request
5. Postcodes.io converts postcode to coordinates
6. Geoapify returns nearby street/address candidates
7. Gemini ranks the streets by estimated parking likelihood
8. Frontend displays results in responsive cards
9. User opens Google Maps or Waze
```

---

## Project Structure

```text
parkradar/
  app/
    api/
      search/
        route.ts
    globals.css
    layout.tsx
    page.tsx

  components/
    DatadogInit.tsx
    ScoreBar.tsx

  lib/
    gemini.ts
    osm.ts
    postcodes.ts
    types.ts

  .github/
    workflows/
      ci.yml

  .env.example
  .gitignore
  package.json
  README.md
```

---

## Important Files

### `app/page.tsx`

Main frontend page.

Responsibilities:

- Render the search UI
- Manage postcode, radius, results, loading, and error state
- Call `/api/search`
- Display ranked parking result cards
- Show Google Maps and Waze buttons
- Track search actions and errors in Datadog

---

### `app/api/search/route.ts`

Main backend API endpoint.

Responsibilities:

- Validate request body
- Convert postcode to coordinates
- Fetch nearby street candidates
- Rank streets using Gemini
- Return structured JSON results

Request example:

```json
{
  "postcode": "SW1A 1AA",
  "radius": 2
}
```

Response example:

```json
{
  "postcode": "SW1A 1AA",
  "radius": 2,
  "location": {
    "lat": 51.501,
    "lon": -0.141
  },
  "results": [
    {
      "streetName": "Example Street",
      "score": 82,
      "reasoning": "Likely residential side street with better parking potential.",
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=...",
      "wazeUrl": "https://waze.com/ul?q=..."
    }
  ]
}
```

---

### `lib/postcodes.ts`

Handles UK postcode geocoding using Postcodes.io.

Input:

```text
SW1A 1AA
```

Output:

```ts
{
  postcode: "SW1A 1AA",
  lat: 51.501,
  lon: -0.141
}
```

This step is needed because street lookup APIs work better with latitude and longitude than with postcode text alone.

---

### `lib/osm.ts`

Despite the filename, this module now handles nearby street discovery using Geoapify.

The filename was kept as `osm.ts` to avoid changing imports across the project, but the implementation has been updated from OpenStreetMap/Overpass to Geoapify for better reliability.

Purpose:

- Accept latitude, longitude, and radius
- Search Geoapify for nearby street/address candidates
- Extract clean street names
- Deduplicate results
- Return a `StreetCandidate[]` list for Gemini ranking

The exported function remains:

```ts
fetchNearbyStreets(lat, lon, radiusMiles);
```

This keeps the rest of the app structure unchanged.

---

### `lib/gemini.ts`

Handles AI-assisted street ranking.

Gemini receives:

- postcode
- radius
- latitude/longitude
- candidate street names

It returns:

- ranked streets
- parking likelihood scores
- short reasoning text

Gemini is asked to return structured JSON with:

```ts
streetName;
score;
reasoning;
```

If Gemini fails or no API key is available, the app uses a fallback ranking function so the MVP still works.

---

### `components/DatadogInit.tsx`

Initializes Datadog Real User Monitoring in the browser.

Datadog tracks:

- page views
- frontend errors
- search actions
- user interactions
- resource loading
- long tasks
- session replay, if enabled

---

## Environment Variables

Create a local `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GEOAPIFY_API_KEY=your_geoapify_api_key

NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_datadog_application_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_client_token
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
NEXT_PUBLIC_DATADOG_SERVICE=parkradar
NEXT_PUBLIC_DATADOG_ENV=local
```

Create `.env.example`:

```env
GEMINI_API_KEY=
GEOAPIFY_API_KEY=

NEXT_PUBLIC_DATADOG_APPLICATION_ID=
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=
NEXT_PUBLIC_DATADOG_SITE=
NEXT_PUBLIC_DATADOG_SERVICE=parkradar
NEXT_PUBLIC_DATADOG_ENV=
```

Do not commit `.env.local`.

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev -- -H 0.0.0.0
```

Open:

```text
http://localhost:3000
```

Useful test postcodes:

```text
SW1A 1AA
M1 1AE
BS1 5TY
EH1 1RE
```

---

## Build and Lint

Run linting:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Clean local build cache:

```bash
rm -rf .next
```

---

## Deployment

The app is deployed on Vercel.

Vercel is connected to the GitHub repository, so pushing to the main branch automatically triggers a new deployment.

Typical flow:

```text
git push
 ↓
GitHub receives commit
 ↓
Vercel detects change
 ↓
Vercel builds the app
 ↓
Vercel deploys production
```

---

## Vercel Environment Variables

In Vercel:

```text
Project
→ Settings
→ Environment Variables
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
GEOAPIFY_API_KEY=your_geoapify_api_key

NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_datadog_application_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_client_token
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
NEXT_PUBLIC_DATADOG_SERVICE=parkradar
NEXT_PUBLIC_DATADOG_ENV=production
```

After changing environment variables, redeploy the project.

---

## CI/CD

This project uses:

- GitHub for source control
- GitHub Actions for CI
- Vercel for CD

CI checks:

- install dependencies
- lint project
- build project

Example workflow:

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  lint-and-build:
    name: Lint and build
    runs-on: ubuntu-latest

    env:
      GEMINI_API_KEY: dummy-key-for-ci
      GEOAPIFY_API_KEY: dummy-key-for-ci
      NEXT_PUBLIC_DATADOG_APPLICATION_ID: dummy
      NEXT_PUBLIC_DATADOG_CLIENT_TOKEN: dummy
      NEXT_PUBLIC_DATADOG_SITE: datadoghq.com
      NEXT_PUBLIC_DATADOG_SERVICE: parkradar
      NEXT_PUBLIC_DATADOG_ENV: ci

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Build app
        run: npm run build
```

---

## Datadog Monitoring

Datadog RUM is used to monitor the frontend.

Tracked events include:

```text
postcode_search_started
postcode_search_completed
frontend errors
page views
resource loading
user interactions
```

Example usage in `app/page.tsx`:

```ts
datadogRum.addAction("postcode_search_started", {
  postcode,
  radius,
});
```

On successful search:

```ts
datadogRum.addAction("postcode_search_completed", {
  postcode: data.postcode ?? postcode,
  radius,
  resultsCount: data.results?.length ?? 0,
});
```

On error:

```ts
datadogRum.addError(err, {
  postcode,
  radius,
  source: "postcode_search",
});
```

Datadog helps answer:

- Are searches working?
- Are users seeing errors?
- Is the app responsive on mobile?
- How often are searches performed?
- Which frontend errors happen most?

---

## Reliability Features

### 1. Geoapify Street Lookup

The app now uses Geoapify for nearby street/address discovery instead of relying on public OpenStreetMap Overpass endpoints.

This improves reliability because the app uses an API key-based service rather than anonymous public infrastructure.

### 2. Gemini Fallback

If Gemini fails, the app still returns ranked results using a fallback function.

This prevents the app from breaking completely if the AI API is unavailable.

### 3. Input Validation

The API validates:

- postcode
- radius
- radius range

### 4. Graceful Errors

The frontend shows friendly errors instead of crashing.

### 5. Stable API Shape

The `fetchNearbyStreets()` function still returns the same `StreetCandidate[]` type, so the rest of the backend and frontend did not need major changes when switching from OpenStreetMap/Overpass to Geoapify.

---

## Why Geoapify Replaced OpenStreetMap/Overpass

The first version of ParkRadar used OpenStreetMap Overpass API directly.

This worked locally at times, but public Overpass endpoints could be unreliable from a deployed Vercel app.

Issues encountered included:

- request timeouts
- `406 Not Acceptable`
- `500 Internal Server Error`
- `502 Bad Gateway`
- slow responses in dense city areas
- public endpoint instability

A Nominatim fallback was also tested, but public Nominatim can block app-style requests and returned `403 Access Denied`.

Because of this, the app was updated to use Geoapify for street lookup while keeping the same internal project structure.

---

## What I Learned

This project was built as a practical full-stack MVP and helped explore several real-world engineering concepts.

### Next.js App Router

Learned how to use:

- `app/page.tsx` for frontend routes
- `app/layout.tsx` for global wrappers
- `app/api/search/route.ts` for backend API routes

### React State

Used React state for:

- postcode input
- live radius slider
- loading states
- error states
- result cards

### TypeScript

Used shared types to keep the API and frontend consistent.

Examples:

```ts
StreetCandidate;
RankedStreet;
SearchResponse;
```

### External API Integration

Integrated multiple external services:

- Postcodes.io
- Geoapify
- Gemini API
- Datadog RUM

### Geoapify Street Search

Learned how to use a location-based search API to fetch street/address candidates near a postcode coordinate.

The app searches common UK street terms such as:

```text
street
road
lane
avenue
close
crescent
drive
place
terrace
way
```

Geoapify results are then cleaned, deduplicated, and sent to Gemini.

### OpenStreetMap and Overpass

The project initially used public OpenStreetMap Overpass endpoints.

This taught an important reliability lesson:

- public APIs can rate limit requests
- public map infrastructure may be unstable
- serverless deployments can behave differently from local development
- production apps should avoid depending on anonymous public APIs at request time

### AI Integration

Learned how to use Gemini for structured ranking and reasoning.

The AI layer is useful for MVP inference, but it is not real-time truth. The app should clearly communicate that results are estimates.

### Prompt Engineering

Gemini is prompted to:

- rank the top 10 streets
- score each street from 0 to 100
- prefer likely residential or side-street candidates
- avoid overclaiming certainty
- return JSON only

### Fallback Design

Learned why fallbacks matter.

A demo app should not break completely if one external service fails.

In this project:

- Gemini has a fallback ranking function
- API errors are caught and returned gracefully
- frontend errors are displayed instead of crashing the UI

### Observability

Added Datadog RUM to understand:

- frontend activity
- errors
- user actions
- performance signals

### Deployment

Deployed the app to Vercel and connected it to GitHub for automatic deployments.

### CI/CD

Added GitHub Actions so code is linted and built before being trusted.

### Security

Learned to keep secrets out of GitHub:

- `.env.local` stays local
- `.env.example` documents required variables
- Vercel stores production secrets
- only `NEXT_PUBLIC_` variables are exposed to the browser
- private API keys such as `GEMINI_API_KEY` and `GEOAPIFY_API_KEY` stay server-side

### Feature Flags

Experimented with LaunchDarkly, then removed it to keep the MVP simple.

Main learning:

- client-side SDKs and server-side SDKs use different keys
- frontend flags require client-side availability
- feature flags are useful, but they add complexity
- for a small MVP, simple environment variables may be enough

---

## Known Limitations

ParkRadar does not currently support:

- real-time parking availability
- paid parking zone detection
- permit restriction detection
- user reports
- map visualization
- saved searches
- authentication
- historical parking trends
- verified parking restrictions

The AI ranking is an estimate and should not be treated as authoritative.

---

## Future Improvements

Potential next steps:

- Add map preview
- Add search result caching
- Add Redis or database persistence
- Add user-submitted parking reports
- Add postcode search history
- Add map markers for ranked streets
- Add Datadog backend logs/APM
- Add rate limiting
- Add better Gemini prompt evaluation
- Add Playwright end-to-end tests
- Add screenshots to README
- Rename `lib/osm.ts` to `lib/streets.ts` or `lib/geoapify.ts`
- Add custom domain

---

## Example Demo Script

```text
1. Open ParkRadar
2. Enter SW1A 1AA
3. Select 1–2 mile radius
4. Click Find Parking
5. Show ranked street cards
6. Explain that Postcodes.io converts the postcode to coordinates
7. Explain that Geoapify fetches nearby street/address candidates
8. Explain that Gemini ranks parking likelihood
9. Click Google Maps or Waze
10. Mention Datadog tracks frontend activity and errors
11. Mention Vercel auto-deploys from GitHub
```

---

## Disclaimer

ParkRadar provides estimated parking likelihood only.

It does not provide real-time parking data or legal parking advice.

Always check:

- street signs
- local restrictions
- permit zones
- payment requirements
- safety conditions

before parking.
