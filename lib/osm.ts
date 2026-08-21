import type { StreetCandidate } from "./types";

type GeoapifyFeature = {
  properties?: {
    name?: string;
    street?: string;
    address_line1?: string;
    formatted?: string;
    result_type?: string;
    lat?: number;
    lon?: number;
  };
};

type GeoapifyResponse = {
  features?: GeoapifyFeature[];
};

export async function fetchNearbyStreets(
  lat: number,
  lon: number,
  radiusMiles: number,
): Promise<StreetCandidate[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEOAPIFY_API_KEY");
  }

  const radiusMeters = Math.min(Math.max(radiusMiles, 0.5), 5) * 1609.34;

  const streets = new Map<string, StreetCandidate>();

  const searchTerms = buildStreetSearchTerms(radiusMiles);

  for (const searchTerm of searchTerms) {
    try {
      const results = await searchGeoapifyStreets({
        searchTerm,
        lat,
        lon,
        radiusMeters,
        apiKey,
      });

      for (const street of results) {
        if (!streets.has(street.name)) {
          streets.set(street.name, street);
        }
      }

      if (streets.size >= 20) {
        break;
      }
    } catch (error) {
      console.error("Geoapify street search failed:", {
        searchTerm,
        error,
      });
    }
  }

  const result = Array.from(streets.values()).slice(0, 30);

  console.log("Geoapify streets found:", result.length);
  console.log(
    "Street names:",
    result.map((street) => street.name),
  );

  if (result.length === 0) {
    throw new Error("Could not find nearby streets from Geoapify");
  }

  return result;
}

function buildStreetSearchTerms(radiusMiles: number) {
  /**
   * Geoapify geocoding is search-based.
   * We search common UK street suffixes and bias/filter around the postcode.
   */
  const broadTerms = [
    "street",
    "road",
    "lane",
    "avenue",
    "close",
    "crescent",
    "drive",
    "place",
    "terrace",
    "way",
  ];

  if (radiusMiles <= 1) {
    return broadTerms.slice(0, 5);
  }

  if (radiusMiles <= 3) {
    return broadTerms.slice(0, 8);
  }

  return broadTerms;
}

async function searchGeoapifyStreets(params: {
  searchTerm: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  apiKey: string;
}): Promise<StreetCandidate[]> {
  const { searchTerm, lat, lon, radiusMeters, apiKey } = params;

  const queryParams = new URLSearchParams({
    text: searchTerm,
    type: "street",
    filter: `circle:${lon},${lat},${Math.round(radiusMeters)}`,
    bias: `proximity:${lon},${lat}`,
    lang: "en",
    limit: "10",
    format: "geojson",
    apiKey,
  });

  const url = `https://api.geoapify.com/v1/geocode/search?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Geoapify API error:", {
      status: response.status,
      errorText: errorText.slice(0, 500),
    });

    throw new Error(`Geoapify failed with status ${response.status}`);
  }

  const data = (await response.json()) as GeoapifyResponse;

  return extractStreetCandidates(data);
}

function extractStreetCandidates(data: GeoapifyResponse): StreetCandidate[] {
  const streets = new Map<string, StreetCandidate>();

  for (const feature of data.features ?? []) {
    const props = feature.properties;

    if (!props) continue;

    const rawName =
      props.street ?? props.name ?? props.address_line1 ?? props.formatted;

    const streetName = cleanStreetName(rawName);

    if (!streetName) continue;

    streets.set(streetName, {
      name: streetName,
      lat: props.lat,
      lon: props.lon,
    });
  }

  return Array.from(streets.values());
}

function cleanStreetName(value?: string) {
  if (!value) return undefined;

  const firstPart = value.split(",")[0]?.trim();

  if (!firstPart) return undefined;

  const withoutLeadingNumber = firstPart.replace(/^\d+[A-Za-z]?\s+/, "").trim();

  if (!withoutLeadingNumber) return undefined;

  const tooGeneric = new Set([
    "street",
    "road",
    "lane",
    "avenue",
    "close",
    "crescent",
    "drive",
    "place",
    "terrace",
    "way",
  ]);

  if (tooGeneric.has(withoutLeadingNumber.toLowerCase())) {
    return undefined;
  }

  return withoutLeadingNumber;
}
