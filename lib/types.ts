export type StreetCandidate = {
  name: string;
  lat?: number;
  lon?: number;
};

export type RankedStreet = {
  streetName: string;
  score: number;
  reasoning: string;
  googleMapsUrl: string;
  wazeUrl: string;
};

export type SearchResponse = {
  postcode: string;
  radius: number;
  location: {
    lat: number;
    lon: number;
  };
  results: RankedStreet[];
};