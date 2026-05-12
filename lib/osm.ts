import type { StreetCandidate } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const USER_AGENT =
  "ParkRadarMVP/1.0 (local-development; contact: parkradar@example.com)";

type OverpassElement = {
  type: string;
  id: number;
  tags?: {
    name?: string;
    highway?: string;
  };
  center?: {
    lat?: number;
    lon?: number;
  };
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

export async function fetchNearbyStreets(
  lat: number,
  lon: number,
  radiusMiles: number
): Promise<StreetCandidate[]> {
  const radiusMeters = Math.min(Math.max(radiusMiles, 0.25), 5) * 1609.34;

  const query = `
[out:json][timeout:25];
(
  way["highway"]["name"](around:${Math.round(radiusMeters)},${lat},${lon});
);
out center tags;
`;

  let lastError: unknown = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log("Trying Overpass endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({
          data: query,
        }).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Overpass failed:", {
          endpoint,
          status: response.status,
          errorText: errorText.slice(0, 500),
        });

        lastError = new Error(
          `Overpass failed at ${endpoint} with status ${response.status}`
        );

        continue;
      }

      const data = (await response.json()) as OverpassResponse;

      const streets = extractStreetCandidates(data);

      console.log("OSM streets found:", streets.length);
      console.log(
        "Street names:",
        streets.map((street) => street.name)
      );

      if (streets.length > 0) {
        return streets;
      }

      lastError = new Error(`No named streets found from ${endpoint}`);
    } catch (error) {
      console.error("Overpass request crashed:", endpoint, error);
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not fetch nearby streets from OpenStreetMap");
}

function extractStreetCandidates(data: OverpassResponse): StreetCandidate[] {
  const streets = new Map<string, StreetCandidate>();

  const excluded = new Set([
    "footway",
    "path",
    "cycleway",
    "pedestrian",
    "steps",
    "bridleway",
    "track",
    "service",
    "motorway",
    "motorway_link",
    "trunk",
    "trunk_link",
  ]);

  for (const element of data.elements ?? []) {
    const name = element.tags?.name?.trim();
    const highway = element.tags?.highway;

    if (!name || !highway) continue;
    if (excluded.has(highway)) continue;

    if (!streets.has(name)) {
      streets.set(name, {
        name,
        lat: element.center?.lat,
        lon: element.center?.lon,
      });
    }
  }

  return Array.from(streets.values()).slice(0, 30);
}