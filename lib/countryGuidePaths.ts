// A small route manifest can be included in the consented analytics client
// without shipping all translated article text to every website visitor.
export const countryGuideRoutes = [
  { country: "india", language: "en" },
  { country: "india", language: "hi" },
  { country: "pakistan", language: "en" },
  { country: "pakistan", language: "ur" },
  { country: "vietnam", language: "en" },
  { country: "vietnam", language: "vi" },
] as const;
export const countryGuidePublicPaths: readonly string[] = ["/learn", ...countryGuideRoutes.map(g => `/learn/${g.country}/${g.language}`)];
