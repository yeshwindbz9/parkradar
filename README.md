# ParkRadar

ParkRadar is a lightweight AI-assisted web application that helps users in the UK find nearby streets with a higher estimated likelihood of free parking.

Users enter a UK postcode and select a search radius. The app converts the postcode into coordinates, fetches nearby streets from OpenStreetMap, ranks them using Gemini AI, and returns a responsive card-based list with Google Maps and Waze navigation links.

Live demo: parkradar.vercel.app

---

## Project Status

ParkRadar is a hobby project.

It is not a real-time parking availability system and does not provide legal parking advice. It estimates likely street parking opportunities based on nearby road data and AI-assisted reasoning.

Always check local signs, permit rules, payment zones, and parking restrictions before parking.

---

## Features

- UK postcode search
- Adjustable search radius
- Live responsive radius slider
- Real nearby street extraction from OpenStreetMap
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
- OpenStreetMap / Overpass API
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
OpenStreetMap / Overpass API
 ↓
Gemini AI Ranking
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
6. OpenStreetMap returns nearby named roads
7. Gemini ranks the streets
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
- Manage postcode/radius/results state
- Call `/api/search`
- Display loading and error states
- Render ranked street cards
- Track search actions in Datadog

---

### `app/api/search/route.ts`

Main backend API endpoint.

Responsibilities:

- Validate request body
- Convert postcode to coordinates
- Fetch nearby streets
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

---

### `lib/osm.ts`

Fetches nearby named streets using OpenStreetMap Overpass API.

The app uses multiple Overpass endpoints for better reliability:

```ts
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
```

This was added because public Overpass endpoints can sometimes rate limit, timeout, or reject requests.

A meaningful `User-Agent` is also used because some Overpass instances reject generic requests.

---

### `lib/gemini.ts`

Handles AI ranking.

Gemini receives:

- postcode
- radius
- latitude/longitude
- candidate street names

It returns:

- ranked streets
- parking likelihood scores
- short reasoning text

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

NEXT_PUBLIC_DATADOG_APPLICATION_ID=your_datadog_application_id
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=your_datadog_client_token
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
NEXT_PUBLIC_DATADOG_SERVICE=parkradar
NEXT_PUBLIC_DATADOG_ENV=local
```

Create `.env.example`:

```env
GEMINI_API_KEY=

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

### 1. Overpass API Failover

The app tries multiple Overpass endpoints because public OpenStreetMap query services can be unreliable.

### 2. Meaningful User-Agent

Overpass providers may reject requests without a useful `User-Agent`.

### 3. Gemini Fallback

If Gemini fails, the app still returns ranked results using a fallback function.

### 4. Input Validation

The API validates:

- postcode
- radius
- radius range

### 5. Graceful Errors

The frontend shows friendly errors instead of crashing.

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
StreetCandidate
RankedStreet
SearchResponse
```

### External API Integration

Integrated multiple external services:

- Postcodes.io
- OpenStreetMap Overpass API
- Gemini API
- Datadog RUM

### OpenStreetMap and Overpass

Learned that public Overpass APIs can:

- rate limit requests
- reject missing User-Agent headers
- return temporary failures
- require endpoint failover for reliability

### AI Integration

Learned how to use Gemini for structured ranking and reasoning.

The AI layer is useful for MVP inference, but it is not real-time truth. The app should clearly communicate that results are estimates.

### Fallback Design

Learned why fallbacks matter.

A demo app should not break completely if one external service fails.

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
- Add custom domain

---

## Example Demo Script

```text
1. Open ParkRadar
2. Enter SW1A 1AA
3. Select 1–2 mile radius
4. Click Find Parking
5. Show ranked street cards
6. Explain that streets are fetched from OpenStreetMap
7. Explain that Gemini ranks parking likelihood
8. Click Google Maps or Waze
9. Mention Datadog tracks frontend activity and errors
10. Mention Vercel auto-deploys from GitHub
```

---


ParkRadar provides estimated parking likelihood only.

It does not provide real-time parking data or legal parking advice.

Always check:

- street signs
- local restrictions
- permit zones
- payment requirements
- safety conditions

before parking.
