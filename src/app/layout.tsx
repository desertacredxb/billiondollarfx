import type { Metadata } from "next";
import Analytics from "../../components/Analytics";
import { Montserrat } from "next/font/google";
import "./globals.css";
import AOSWrapper from "../../components/AOSWrapper";
import WhatsAppButton from "../../components/WhatsappButton";
import SupportGuide from "../../components/chat/SupportGuide";
import { SITE_ORIGIN } from "../../lib/seo";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "Billion Dollar FX | Forex, CFD & MT5 Trading",
  description: "Explore forex and CFDs with Billion Dollar FX. Review the Liquid account, MT5 platform, verification and trading risks.",
  openGraph: { siteName: "Billion Dollar FX", type: "website", images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "Billion Dollar FX" }] },
  twitter: { card: "summary_large_image", images: ["/social-card.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="8lTSuR5UYvf6hPgYpADzJxRnZCQ2eWRFJpSJ4KAcNC4"
        />
        <meta
          name="google-site-verification"
          content="qNVog24IqS13Q1uSqt3IzAtphrvW9-G5BXJ_eKf-p5E"
        />
        <link rel="icon" href="/favicon.ico" />

        <style>{`
          body > .skiptranslate {
            display: none;
          }
          .goog-te-banner-frame.skiptranslate {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
          @media print {
            #google_translate_element {
              display: none;
            }
          }
        `}</style>

        {/* Meta Pixel Code */}
        <script>
          {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1542342710632686');
            fbq('track', 'PageView');`}
        </script>
        <noscript><img height="1" width="1" style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1542342710632686&ev=PageView&noscript=1"
        /></noscript>
        {/* End Meta Pixel Code */}
      </head>

      <body className={montserrat.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-white focus:p-3 focus:text-black">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: "Billion Dollar FX", url: SITE_ORIGIN, email: "support@billiondollarfx.com", telephone: "+447999283366" }).replace(/</g, "\\u003c") }} />
        <AOSWrapper><div id="main-content" tabIndex={-1}>{children}</div>


        </AOSWrapper>

        <WhatsAppButton />
        <SupportGuide />
        <Analytics />
        {/* <AIChat /> */}


      </body>
    </html>
  );
}
