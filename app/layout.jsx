import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata = {
  title: "Faith Haven House | Transitional Living Facility for Homeless Men",
  description:
    "Faith Haven House is a transitional living facility for homeless men in St. Charles County, helping residents start the rebuilding process and transition to stable environments.",
  icons: {
    icon: "/assets/fhh-favicon.png",
    shortcut: "/assets/fhh-favicon.png",
    apple: "/assets/fhh-favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {/* Global Lenis smooth scroll + GSAP ScrollTrigger sync — runs on every page */}
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
