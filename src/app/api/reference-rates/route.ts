import { NextResponse } from "next/server";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const currencies = params.get("currencies") === "1";
  const base = (params.get("base") || "USD").toUpperCase(), quote = (params.get("quote") || "INR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) return NextResponse.json({ message: "Choose valid currency codes." }, { status: 400 });
  if (!currencies && base === quote) return NextResponse.json({ base, quote, rate: 1, date: null, source: "Same currency" });
  try {
    const url = currencies ? "https://api.frankfurter.dev/v2/currencies" : `https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}`;
    const response = await fetch(url, { next: { revalidate: currencies ? 86400 : 3600 }, headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Reference data unavailable");
    const data = await response.json();
    if (currencies) {
      if (!Array.isArray(data)) throw new Error("Invalid currency list");
      return NextResponse.json({ data: data.filter(row => /^[A-Z]{3}$/i.test(row.iso_code) && typeof row.name === "string").map(row => ({ code: row.iso_code.toUpperCase(), name: row.name })) });
    }
    if (typeof data.rate !== "number" || !Number.isFinite(data.rate) || data.rate <= 0 || typeof data.date !== "string") throw new Error("Invalid reference rate");
    return NextResponse.json({ base, quote, rate: data.rate, date: data.date, source: "Frankfurter" });
  } catch { return NextResponse.json({ message: "Reference exchange rates are temporarily unavailable. Please try again shortly." }, { status: 503 }); }
}
