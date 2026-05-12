import { NextRequest, NextResponse } from "next/server";
import { geocodePostcode } from "@/lib/postcodes";
import { fetchNearbyStreets } from "@/lib/osm";
import { fallbackRankStreets, rankStreetsWithGemini } from "@/lib/gemini";
import type { StreetCandidate } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const postcode = String(body.postcode ?? "").trim();
    const radius = Number(body.radius ?? 1);

    if (!postcode) {
      return NextResponse.json(
        { error: "Postcode is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(radius) || radius < 0.25 || radius > 5) {
      return NextResponse.json(
        { error: "Radius must be between 0.25 and 5 miles" },
        { status: 400 }
      );
    }

    const location = await geocodePostcode(postcode);

    let streets: StreetCandidate[] = [];

    try {
    streets = await fetchNearbyStreets(location.lat, location.lon, radius);

    console.log("OSM streets found:", streets.length);
    // console.log(
    //     "Street names:",
    //     streets.map((street) => street.name)
    // );
    } catch (error) {
    console.error("OSM street lookup failed:", error);

    return NextResponse.json(
        {
        error:
            "Could not fetch real nearby streets from OpenStreetMap. Please try again in a moment or increase the radius.",
        },
        { status: 502 }
    );
    }

    if (streets.length === 0) {
      return NextResponse.json({
        postcode: location.postcode,
        radius,
        location: {
          lat: location.lat,
          lon: location.lon,
        },
        results: [],
      });
    }

    const results = await rankStreetsWithGemini({
      postcode: location.postcode,
      radius,
      lat: location.lat,
      lon: location.lon,
      streets,
    });

    return NextResponse.json({
      postcode: location.postcode,
      radius,
      location: {
        lat: location.lat,
        lon: location.lon,
      },
      results: results.length
        ? results
        : fallbackRankStreets({
            postcode: location.postcode,
            streets,
          }),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try another UK postcode.",
      },
      { status: 500 }
    );
  }
}