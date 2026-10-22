import type { Metadata } from "next";
import WebsiteAnalytics from "../../../../components/WebsiteAnalytics";
export const metadata: Metadata = { title: "Website Analytics | BDFX Admin", robots: { index: false, follow: false } };
export default function AnalyticsPage() { return <WebsiteAnalytics />; }
