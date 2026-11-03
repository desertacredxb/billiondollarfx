import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../../../components/Navbar";
import Footer from "../../../../../components/Footer";
import { countryGuides, getCountryGuide, guideAlternates, guidePath, guideUpdated, guideUrl } from "../../../../../lib/countryGuides";
import { SITE_ORIGIN } from "../../../../../lib/seo";

type Props = { params: Promise<{ country: string; language: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => countryGuides.map(({ country, language }) => ({ country, language }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, language } = await params;
  const guide = getCountryGuide(country, language);
  if (!guide) notFound();
  return { title: guide.title, description: guide.description, alternates: { canonical: guideUrl(guide), languages: guideAlternates(country) }, robots: { index: true, follow: true },
    openGraph: { type: "article", title: guide.title, description: guide.description, url: guideUrl(guide), locale: guide.locale.replace("-", "_"), siteName: "Billion Dollar FX", images: [{ url: `${SITE_ORIGIN}/social-card.png`, width: 1200, height: 630, alt: "Billion Dollar FX" }] },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description } };
}

export default async function CountryGuide({ params }: Props) {
  const { country, language } = await params;
  const guide = getCountryGuide(country, language);
  if (!guide) notFound();
  const direction = language === "ur" ? "rtl" : "ltr";
  const siblings = countryGuides.filter(g => g.country === country);
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: guide.heading, description: guide.description, inLanguage: guide.locale, datePublished: guideUpdated, dateModified: guideUpdated, mainEntityOfPage: guideUrl(guide), author: { "@type": "Organization", name: "Billion Dollar FX", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "Billion Dollar FX", url: SITE_ORIGIN }, citation: guide.sources.map(source => source.url) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "BDFX", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: guide.ui.home, item: `${SITE_ORIGIN}/learn` }, { "@type": "ListItem", position: 3, name: guide.heading, item: guideUrl(guide) }] },
  ] };
  return <><Navbar /><main lang={guide.locale} dir={direction} style={language === "en" ? undefined : { fontFamily: "Arial, sans-serif" }} className="bg-[#0a0f1c] px-5 pb-20 pt-32 text-white">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <article className="mx-auto max-w-5xl">
      <Link href="/learn" className="text-sm text-[#d6b659] underline underline-offset-4">{guide.ui.home}</Link>
      <nav aria-label={guide.ui.languages} className="mt-7 flex flex-wrap items-center gap-3 text-sm"><span className="me-1 text-slate-400">{guide.ui.languages}</span>{siblings.map(sibling => <Link key={sibling.language} href={guidePath(sibling)} hrefLang={sibling.locale} aria-current={sibling.language === language ? "page" : undefined} className={`min-h-11 rounded-lg border px-4 py-3 ${sibling.language === language ? "border-[#d6b659] bg-[#d6b659]/10 text-[#f1d683]" : "border-slate-600 text-slate-200 hover:border-[#d6b659]"}`}>{sibling.languageName}</Link>)}</nav>
      <p className="mt-10 text-sm font-semibold tracking-wider text-[#d6b659]">BDFX · {guide.countryName}</p>
      <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl md:leading-tight">{guide.heading}</h1>
      <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-300">{guide.intro}</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_290px]">
        <div className="space-y-9">{guide.sections.map(section => <section key={section.title}><h2 className="text-2xl font-semibold leading-normal">{section.title}</h2><p className="mt-4 leading-9 text-slate-300">{section.text}</p></section>)}</div>
        <aside className="self-start rounded-2xl border border-slate-700 bg-[#101827] p-6"><h2 className="text-xl font-semibold leading-normal">{guide.ui.glossary}</h2><dl className="mt-5 space-y-5">{guide.terms.map(term => <div key={term.term}><dt className="font-semibold text-[#e3c877]">{term.term}</dt><dd className="mt-2 text-sm leading-7 text-slate-300">{term.meaning}</dd></div>)}</dl></aside>
      </div>
      <section className="mt-12 rounded-2xl border border-slate-700 p-6 md:p-8"><h2 className="text-xl font-semibold">{guide.ui.sources}</h2><ul className="mt-5 space-y-4">{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="break-words text-sm leading-7 text-[#e3c877] underline underline-offset-4">{source.label}</a></li>)}</ul><p className="mt-6 text-xs leading-6 text-slate-400">{guide.ui.sourceDate}</p></section>
      <p className="mt-8 border-s-2 border-[#d6b659] ps-5 text-sm leading-8 text-slate-400">{guide.notice}</p>
      <div className="mt-8 flex flex-wrap gap-3"><Link href="/education" className="min-h-11 rounded-lg bg-[#d6b659] px-5 py-3 text-sm font-semibold text-[#101827]">{guide.ui.education}</Link><Link href="/help-centre" className="min-h-11 rounded-lg border border-slate-600 px-5 py-3 text-sm text-white">{guide.ui.help}</Link><Link href="/risk-discloser" className="px-3 py-3 text-sm text-[#e3c877] underline underline-offset-4">{guide.ui.risk}</Link></div>
    </article>
  </main><Footer /></>;
}
