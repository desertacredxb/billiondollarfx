import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { countryGuides, countryOptions, guidePath } from "../../../lib/countryGuides";
import { pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata("/learn", "Country Learning Guides: India, Pakistan & Vietnam | BDFX", "Explore BDFX educational guides for India, Pakistan and Vietnam in English, Hindi, Urdu and Vietnamese. Understand platform terms and official local guidance.");

export default function CountryLearningHub() {
  return <><Navbar /><main className="bg-[#0a0f1c] px-5 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl">
    <p className="text-sm font-semibold tracking-widest text-[#d6b659]">BDFX LEARNING</p>
    <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">Clearer knowledge. Local context.</h1>
    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">Choose a country and language to learn platform terminology, understand risk and find relevant official information. Each guide is an educational resource, not a confirmation of local authorization or service eligibility.</p>
    <div className="mt-12 grid gap-6 md:grid-cols-3">{countryOptions.map(country => <article key={country.key} className="flex flex-col rounded-2xl border border-slate-700 bg-[#101827] p-7">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d6b659]/40 text-sm font-semibold text-[#d6b659]">{country.code}</span>
      <h2 className="mt-6 text-2xl font-semibold">{country.name}</h2><p className="mt-1 text-lg text-slate-400">{country.native}</p>
      <p className="mt-5 flex-1 leading-7 text-slate-300">{country.summary}</p>
      <nav aria-label={`${country.name} guide languages`} className="mt-7 flex flex-wrap gap-3">{countryGuides.filter(g => g.country === country.key).map(guide => <Link key={guide.language} href={guidePath(guide)} hrefLang={guide.locale} className="min-h-11 rounded-lg border border-slate-600 px-4 py-3 text-sm font-semibold text-[#d6b659] hover:border-[#d6b659]">{guide.languageName}</Link>)}</nav>
    </article>)}</div>
    <div className="mt-10 flex flex-wrap gap-5 text-sm"><Link href="/education" className="text-[#d6b659] underline underline-offset-4">Trading basics</Link><Link href="/blogs" className="text-[#d6b659] underline underline-offset-4">Educational articles</Link><Link href="/help-centre" className="text-[#d6b659] underline underline-offset-4">Help centre</Link></div>
  </div></main><Footer /></>;
}
