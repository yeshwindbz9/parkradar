export async function geocodePostcode(postcode: string) {
  const cleanPostcode = postcode.trim();

  if (!cleanPostcode) {
    throw new Error("Postcode is required");
  }

  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Invalid or unsupported UK postcode");
  }

  const data = await response.json();

  const lat = data?.result?.latitude;
  const lon = data?.result?.longitude;

  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("Could not find coordinates for this postcode");
  }

  return {
    postcode: data.result.postcode as string,
    lat,
    lon,
  };
}