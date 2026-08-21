import type { StreetCandidate } from "./types";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const USER_AGENT =
  "Mozilla/5.0 ParkRadarMVP/1.0 (https://parkradar.vercel.app; contact: parkradar@example.com)";

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

type NominatimPlace = {
  display_name?: string;
  name?: string;
  type?: string;
  class?: string;
  lat?: string;
  lon?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
  };
};

export async function fetchNearbyStreets(
  lat: number,
  lon: number,
  radiusMiles: number,
): Promise<StreetCandidate[]> {
  try {
    const overpassStreets = await fetchNearbyStreetsFromOverpass(
      lat,
      lon,
      radiusMiles,
    );

    if (overpassStreets.length > 0) {
      return overpassStreets;
    }
  } catch (error) {
    console.error(
      "All Overpass attempts failed. Falling back to Nominatim:",
      error,
    );
  }

  const nominatimStreets = await fetchNearbyStreetsFromNominatim(lat, lon);

  if (nominatimStreets.length > 0) {
    return nominatimStreets;
  }

  throw new Error("Could not fetch nearby streets from OpenStreetMap services");
}

async function fetchNearbyStreetsFromOverpass(
  lat: number,
  lon: number,
  radiusMiles: number,
): Promise<StreetCandidate[]> {
  const requestedRadiusMeters = radiusMiles * 1609.34;

  const radiusAttempts = [Math.min(requestedRadiusMeters, 1200), 800, 500];

  let lastError: unknown = null;

  for (const radiusMeters of radiusAttempts) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        console.log("Trying Overpass endpoint:", endpoint);
        console.log("Trying radius meters:", Math.round(radiusMeters));

        const query = buildOverpassQuery(lat, lon, radiusMeters);
        const url = `${endpoint}?data=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-GB,en;q=0.9",
          },
          cache: "no-store",
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

        console.log("OSM Overpass streets found:", streets.length);
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
    : new Error("Could not fetch nearby streets from Overpass");
}

function buildOverpassQuery(lat: number, lon: number, radiusMeters: number) {
  const radius = Math.round(radiusMeters);

  return `
[out:json][timeout:15];
(
  way["highway"~"^(residential|living_street|unclassified|tertiary|secondary|primary)$"]["name"](around:${radius},${lat},${lon});
);
out center tags 30;
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

async function fetchNearbyStreetsFromNominatim(
  lat: number,
  lon: number,
): Promise<StreetCandidate[]> {
  console.log("Trying Nominatim fallback");

  /**
   * Small bounding box around the postcode coordinate.
   * Roughly around 1-1.5km depending on latitude.
   */
  const delta = 0.012;

  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  const params = new URLSearchParams({
    format: "jsonv2",
    q: "street",
    bounded: "1",
    limit: "30",
    addressdetails: "1",
    viewbox: `${left},${top},${right},${bottom}`,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-GB,en;q=0.9",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Nominatim fallback failed:", {
      status: response.status,
      errorText: errorText.slice(0, 500),
    });

    throw new Error(`Nominatim failed with status ${response.status}`);
  }

  const places = (await response.json()) as NominatimPlace[];

  const streets = new Map<string, StreetCandidate>();

  for (const place of places) {
    const road =
      place.address?.road ??
      place.address?.pedestrian ??
      place.name ??
      extractStreetNameFromDisplayName(place.display_name);

    if (!road) continue;

    const cleanName = road.trim();

    if (!cleanName) continue;

    streets.set(cleanName, {
      name: cleanName,
      lat: place.lat ? Number(place.lat) : undefined,
      lon: place.lon ? Number(place.lon) : undefined,
    });
  }

  const result = Array.from(streets.values()).slice(0, 20);

  console.log("Nominatim streets found:", result.length);
  console.log(
    "Nominatim street names:",
    result.map((street) => street.name),
  );

  return result;
}

function extractStreetNameFromDisplayName(displayName?: string) {
  if (!displayName) return undefined;

  const firstPart = displayName.split(",")[0]?.trim();

  if (!firstPart) return undefined;

  return firstPart;
}
