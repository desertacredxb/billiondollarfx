import VeriffVerification from "../../../components/settings/VeriffVerification";

export default async function VerifyIdentityPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const params = await searchParams;
  return <main className="min-h-screen bg-black px-4 py-16"><VeriffVerification forIb={params.returnTo === "ib"} /></main>;
}
