# ParkRadar

ParkRadar is a lightweight MVP web app that helps UK users find nearby streets with a higher estimated likelihood of free parking.

## Features

- UK postcode search
- Radius selection
- Nearby street extraction from OpenStreetMap
- AI-assisted street ranking using Gemini
- Google Maps and Waze links

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Vercel API Routes
- Postcodes.io
- OpenStreetMap / Overpass API
- Gemini API

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev