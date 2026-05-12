"use client";

import { useState } from "react";

type RankedStreet = {
  streetName: string;
  score: number;
  reasoning: string;
  googleMapsUrl: string;
  wazeUrl: string;
};

export default function HomePage() {
  const [postcode, setPostcode] = useState("SW1A 1AA");
  const [radius, setRadius] = useState(2);
  const [results, setResults] = useState<RankedStreet[]>([]);
  const [searchedPostcode, setSearchedPostcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    setLoading(true);
    setError("");
    setResults([]);
    setSearchedPostcode("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postcode,
          radius,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      setResults(data.results ?? []);
      setSearchedPostcode(data.postcode ?? postcode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_72%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20">
              YR
            </div>

            <div>
              <p className="text-sm font-black tracking-tight">ParkRadar</p>
              <p className="hidden text-xs text-slate-400 sm:block">
                AI-assisted free street parking search app
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300 sm:flex">
            <span className="size-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.9)]" />
            API Online
          </div>
        </nav>

        <header className="grid gap-8 pt-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-200 shadow-lg shadow-teal-950/20">
              <span className="size-2 rounded-full bg-teal-300" />
              Parking Simplified
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Find better parking signals near any UK postcode.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              ParkRadar checks nearby streets, ranks likely free-parking
              candidates, and gives you one-tap routing through Google Maps or
              Waze.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <StatCard label="Coverage" value="Great Britian" />
              <StatCard label="Radius" value={`${radius} mi`} />
              <StatCard label="Output" value="Ranked" />
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-400">
                    Live search radius
                  </p>

                  <p className="mt-2 text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">
                    {radius}
                    <span className="ml-2 text-lg font-semibold tracking-normal text-teal-200">
                      miles
                    </span>
                  </p>
                </div>

                {/* <div className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold text-teal-200">
                  live
                </div> */}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex justify-between text-xs text-slate-400">
                  <span>0.5 mi</span>
                  <span>5 mi</span>
                </div>

                <input
                  aria-label="Search radius"
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="w-full accent-teal-300"
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <MiniMetric label="Tech" value="React" />
                <MiniMetric label="Data" value="OSM" />
                <MiniMetric label="AI" value="Gemini" />
              </div>
            </div>
          </section>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px_auto] lg:items-end">
            <div>
              <label
                htmlFor="postcode"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                UK postcode
              </label>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-1 transition focus-within:border-teal-300/60 focus-within:ring-4 focus-within:ring-teal-300/10">
                <input
                  id="postcode"
                  value={postcode}
                  onChange={(event) => setPostcode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="e.g. SW1A 1AA"
                  className="w-full rounded-xl bg-transparent px-4 py-4 text-base font-bold uppercase tracking-wide text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="radius"
                  className="text-sm font-semibold text-slate-300"
                >
                  Radius
                </label>

                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-black text-teal-200">
                  {radius} miles
                </span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
                <input
                  id="radius"
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  className="w-full accent-teal-300"
                />

                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>0.5</span>
                  <span>5</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-white px-6 py-5 text-base font-black text-slate-950 shadow-2xl shadow-teal-950/30 transition hover:-translate-y-0.5 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            >
              <span className="relative z-10">
                {loading ? "Scanning..." : "Find Parking"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-teal-300/50 to-transparent transition duration-700 group-hover:translate-x-full" />
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
              {error}
            </div>
          )}
        </section>

        {loading && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.055] backdrop-blur-xl"
              />
            ))}
          </section>
        )}

        {!loading && results.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-200">
                  Ranked output
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                  Streets near {searchedPostcode}
                </h2>
              </div>

              <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
                {results.length} streets found
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((street, index) => (
                <StreetCard
                  key={`${street.streetName}-${index}`}
                  street={street}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && results.length === 0 && (
          <section className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.035] p-8 text-center backdrop-blur-xl">
            <p className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-teal-300/10 text-xl">
              ⌁
            </p>

            <h2 className="text-2xl font-black tracking-[-0.03em]">
              Ready to scan nearby streets
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Try SW1A 1AA, M1 1AE, BS1 5TY, EH1 1RE, or another UK postcode.
            </p>
          </section>
        )}

        <footer className="border-t border-white/10 py-6 text-xs leading-6 text-slate-500">
          ParkRadar provides estimated parking likelihood only. Always check
          street signs, permits, payment zones, local restrictions, and safety
          before parking.
        </footer>
      </section>
    </main>
  );
}

function StreetCard({
  street,
  index,
}: {
  street: RankedStreet;
  index: number;
}) {
  const score = Math.max(0, Math.min(100, Math.round(street.score)));

  return (
    <article className="group flex min-h-[320px] flex-col rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-teal-300/30 hover:bg-white/[0.075] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-teal-200">Rank #{index + 1}</p>

          <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.04em] text-white">
            {street.streetName}
          </h3>
        </div>

        <div className="shrink-0 rounded-2xl bg-teal-300 px-3 py-2 text-sm font-black text-slate-950 shadow-lg shadow-teal-400/20">
          {score}/100
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">Parking likelihood</span>
          <span className="font-black text-teal-200">{score}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-300 to-emerald-300 shadow-[0_0_18px_rgba(45,212,191,0.45)] transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
        {street.reasoning}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href={street.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-black text-white transition hover:border-teal-300/40 hover:bg-teal-300/10"
        >
          Google Maps
        </a>

        <a
          href={street.wazeUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-teal-200"
        >
          Waze
        </a>
      </div>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-teal-200">{value}</p>
    </div>
  );
}