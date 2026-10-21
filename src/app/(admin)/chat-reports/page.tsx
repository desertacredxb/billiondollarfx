import type { Metadata } from "next";
import ChatReports from "../../../../components/ChatReports";
export const metadata: Metadata = { title: "Chat Reports | BDFX Admin", robots: { index: false, follow: false } };
export default function ChatReportsPage() { return <ChatReports />; }
