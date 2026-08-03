import { Inter } from "next/font/google";
import "./globals.css";
import { TransportProvider } from "@/context/TransportContext";
import { UserProvider }      from "@/context/UserContext";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Gayatri Agencies",
  description: "Transport and logistics management portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-N3ZDXRR1SB" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-N3ZDXRR1SB');
        `}</Script>
        <UserProvider>
          <TransportProvider>
            {children}
          </TransportProvider>
        </UserProvider>
      </body>
    </html>
  );
}
