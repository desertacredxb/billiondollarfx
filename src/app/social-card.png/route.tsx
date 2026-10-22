import { ImageResponse } from "next/og";
export function GET() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#080f1c", color: "#ffffff", padding: "80px", borderBottom: "14px solid #d6b659" }}><div style={{ fontSize: 25, color: "#d6b659", letterSpacing: 6, marginBottom: 35 }}>BDFX</div><div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Billion Dollar FX</div><div style={{ fontSize: 30, color: "#c5cbd5", marginTop: 30 }}>Forex · CFDs · MetaTrader 5</div><div style={{ fontSize: 21, color: "#d6b659", marginTop: 70 }}>www.billiondollarfx.com</div></div>, { width: 1200, height: 630 });
}
