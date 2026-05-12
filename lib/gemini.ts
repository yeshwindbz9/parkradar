import { GoogleGenAI, Type } from "@google/genai";
import type { RankedStreet, StreetCandidate } from "./types";

function createMapLinks(streetName: string, postcode: string) {
  const query = `${streetName}, ${postcode}, UK`;

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`,
    wazeUrl: `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`,
  };
}

export function fallbackRankStreets(params: {
  postcode: string;
  streets: StreetCandidate[];
}): RankedStreet[] {
  return params.streets.slice(0, 10).map((street, index) => {
    const score = Math.max(45, 88 - index * 5);

    return {
      streetName: street.name,
      score,
      reasoning:
        "Estimated using nearby street data only. AI ranking is unavailable, so this is a simple fallback result.",
      ...createMapLinks(street.name, params.postcode),
    };
  });
}

export async function rankStreetsWithGemini(params: {
  postcode: string;
  radius: number;
  lat: number;
  lon: number;
  streets: StreetCandidate[];
}): Promise<RankedStreet[]> {
  const { postcode, radius, lat, lon, streets } = params;

  if (streets.length === 0) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackRankStreets({ postcode, streets });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are helping rank UK streets by estimated likelihood of available free parking.

This is not real-time parking data.
Use cautious reasoning based on typical UK parking patterns.

Input:
Postcode: ${postcode}
Radius miles: ${radius}
Location: ${lat}, ${lon}

Candidate streets:
${streets.map((s, i) => `${i + 1}. ${s.name}`).join("\n")}

Task:
Return the top 10 streets only.

Scoring rules:
- score must be 0 to 100
- higher score means more likely to find free parking
- consider likely residential roads, side streets, roads away from major landmarks, and roads less likely to be commercial/tourist-heavy
- do not invent restrictions
- mention uncertainty where appropriate

Return JSON only.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              streetName: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ["streetName", "score", "reasoning"],
          },
        },
      },
    });

    const raw = response.text ?? "[]";

    const parsed = JSON.parse(raw) as Array<{
      streetName: string;
      score: number;
      reasoning: string;
    }>;

    return parsed.slice(0, 10).map((street) => ({
      streetName: street.streetName,
      score: Math.max(0, Math.min(100, Math.round(street.score))),
      reasoning: street.reasoning,
      ...createMapLinks(street.streetName, postcode),
    }));
  } catch {
    return fallbackRankStreets({ postcode, streets });
  }
}