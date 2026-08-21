import type { StreetCandidate } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const USER_AGENT =
  "ParkRadarMVP/1.0 (parking discovery app; contact: parkradar@example.com)";

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
  radiusMiles: number,
): Promise<StreetCandidate[]> {
  const requestedRadiusMeters = radiusMiles * 1609.34;

  /**
   * Important:
   * A 5-mile Overpass query in dense UK cities can be huge.
   * We cap and retry smaller radii so public Overpass instances do not fail.
   */
  const radiusAttempts = [Math.min(requestedRadiusMeters, 1600), 1000, 600];

  let lastError: unknown = null;

  for (const radiusMeters of radiusAttempts) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        console.log("Trying Overpass endpoint:", endpoint);
        console.log("Trying radius meters:", Math.round(radiusMeters));

        const query = buildOverpassQuery(lat, lon, radiusMeters);

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
            radiusMeters: Math.round(radiusMeters),
            status: response.status,
            errorText: errorText.slice(0, 500),
          });

          lastError = new Error(
            `Overpass failed at ${endpoint} with status ${response.status}`,
          );

          continue;
        }

        const data = (await response.json()) as OverpassResponse;

        const streets = extractStreetCandidates(data);

        console.log("OSM streets found:", streets.length);
        console.log(
          "Street names:",
          streets.map((street) => street.name),
        );

        if (streets.length > 0) {
          return streets;
        }

        lastError = new Error(
          `No named streets found from ${endpoint} at radius ${radiusMeters}`,
        );
      } catch (error) {
        console.error("Overpass request crashed:", {
          endpoint,
          radiusMeters: Math.round(radiusMeters),
          error,
        });

        lastError = error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not fetch nearby streets from OpenStreetMap");
}

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number) {
  const radius = Math.round(radiusMeters);

  return `
[out:json][timeout:20];
(
  way["highway"~"^(residential|living_street|unclassified|tertiary|secondary|primary)$"]["name"](around:${radius},${lat},${lon});
);
out center tags 40;
`;
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
