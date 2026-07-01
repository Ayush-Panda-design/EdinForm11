import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./dashboard-themes.css";
import "./dashboard-animations.css";
import { GlobalProviders } from "~/providers/global";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdinForm — Forms, drawn in the city of light and rain.",
  description:
    "EdinForm is a cinematic studio for the questions you ask the world. Design forms, gather replies, and read results inside a calm, considered workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Script id="theme-boot" strategy="beforeInteractive">
          {`(function(){try{var k="formcraft_theme";var t=localStorage.getItem(k);var root=document.documentElement;if(t==="light"){root.classList.remove("dark");root.classList.add("light");root.setAttribute("data-theme","light");}else{root.classList.add("dark");root.classList.remove("light");root.setAttribute("data-theme","dark");}}catch(e){}})();`}
        </Script>
        <Script id="dashboard-template-boot" strategy="beforeInteractive">
          {`(function(){try{var k="edinform_dashboard_template";var v=localStorage.getItem(k);var ids=["edinform","studio","vintage","web3","restaurant","analytics"];if(ids.indexOf(v)!==-1)document.documentElement.setAttribute("data-dashboard-template",v);}catch(e){}})();`}
        </Script>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
