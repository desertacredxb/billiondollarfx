import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import CurrencyConverter from "../../../components/CurrencyConverter";
export default function Page() { return <><Navbar /><main className="bg-[#0a0f1c] px-5 pb-20 pt-32 text-white"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-semibold md:text-5xl">Currency converter</h1><p className="my-6 max-w-3xl leading-7 text-slate-300">Compare currencies using dated reference rates.</p><CurrencyConverter /><p className="mt-8 text-sm text-slate-400">Need help with your platform or account? <Link href="/help-centre" className="text-[#d6b659] underline">Visit the help centre</Link>.</p></div></main><Footer /></>; }
