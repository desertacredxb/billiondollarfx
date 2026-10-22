import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { publishedBlogs } from "../lib/blogApi";
export default async function News() {
  let articles: { title: string; slug: string }[] = [];
  let unavailable = false;
  try { articles = (await publishedBlogs({ limit: "6" })).data; } catch { unavailable = true; }
  return <><Navbar /><main className="bg-[#0a0f1c] px-5 pb-20 pt-32 text-white"><div className="mx-auto max-w-5xl"><p className="text-sm text-[#d6b659]">BDFX Insights</p><h1 className="mt-3 text-4xl font-semibold">Published updates and market tools</h1><p className="mt-5 max-w-3xl leading-7 text-slate-300">Read articles published by the BDFX team or use the economic calendar to check scheduled releases. Publication dates and reference data should be checked before relying on an update.</p><section className="mt-10"><h2 className="text-2xl font-semibold">Latest articles</h2>{articles.length ? <ul className="mt-5 grid gap-4 sm:grid-cols-2">{articles.map(article => <li key={article.slug}><Link href={`/blogs/${encodeURIComponent(article.slug)}`} className="block rounded-xl border border-slate-700 bg-[#101827] p-6 text-lg text-[#d6b659]">{article.title}<span className="mt-4 block text-sm">Read article →</span></Link></li>)}</ul> : <p role="status" className="mt-5 rounded-xl border border-slate-700 p-6 text-slate-300">{unavailable ? "Published articles are temporarily unavailable. Please try again shortly." : "No articles have been published yet. Check the calendar and learning resources below."}</p>}</section><div className="mt-8 flex flex-wrap gap-4">{[["Economic calendar", "/economic-calendar"], ["Trading basics", "/education"], ["All published articles", "/blogs"], ["Help Centre", "/help-centre"]].map(([label, href]) => <Link key={href} href={href} className="rounded-lg border border-slate-600 px-4 py-3 text-sm text-[#d6b659]">{label}</Link>)}</div></div></main><Footer /></>;
}
