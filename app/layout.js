import { Inter } from "next/font/google";
import "./globals.css";
import { TransportProvider } from "@/context/TransportContext";
import { UserProvider }      from "@/context/UserContext";

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
        <UserProvider>
          <TransportProvider>
            {children}
          </TransportProvider>
        </UserProvider>
      </body>
    </html>
  );
}
