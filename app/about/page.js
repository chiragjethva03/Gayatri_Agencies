"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"] 
});

export default function AboutPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
      setShowMobileWarning(true);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] ${montserrat.className} text-slate-800 flex flex-col relative`}>
      
      {/* --- RESPONSIVE SHARED NAVIGATION BAR --- */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            
            <div className="flex items-center gap-3">
              <Link href="/">
                <img 
                  src="/android-chrome-192x192.png" 
                  alt="Gayatri Agency Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain mix-blend-darken brightness-110 contrast-125 [clip-path:inset(2px)]" 
                />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-12 items-center">
              <Link href="/" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Home
              </Link>
              <Link href="/about" className="text-[13px] text-[#113741] font-bold tracking-widest hover:text-orange-500 transition uppercase">
                About Us
              </Link>
              <Link href="/inquiry" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Inquiry Us
              </Link>
              <Link href="/contactus" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Contact Us
              </Link>
            </div>

            {/* Buttons & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLoginClick}
                className="hidden sm:block bg-[#113741] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md text-xs md:text-sm font-bold tracking-wide hover:bg-teal-900 transition shadow-lg"
              >
                ERP Login
              </button>
              
              <button 
                className="md:hidden text-[#113741] p-2 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[80px] left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-4 flex flex-col gap-6 z-40">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Home
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-[#113741] font-bold tracking-widest uppercase">
              About Us
            </Link>
            <Link href="/inquiry" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Inquiry Us
            </Link>
            <Link href="/contactus" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Contact Us
            </Link>
            <button 
              onClick={handleLoginClick}
              className="bg-[#113741] text-white px-6 py-3 rounded-md text-sm font-bold tracking-wide text-center mt-2"
            >
              ERP Login
            </button>
          </div>
        )}
      </nav>

      {/* --- ABOUT US CONTENT --- */}
      <main className="flex-1 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-[#113741] mb-4 tracking-tight">
              About Us
            </h1>
            <div className="w-16 h-1 bg-orange-500 mx-auto mb-6"></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            
            <div className="lg:w-1/2 space-y-6 text-[15px] text-gray-600 leading-relaxed">
              <h2 className="text-2xl font-bold text-[#113741] mb-4">Our Story & Vision</h2>
              <p>
                Founded in 1997, <span className="font-semibold text-gray-900">Gayatri Agency</span> began as a small transport and warehousing service in Ahmedabad. With over 28+ years of experience, 45+ transport partnerships, and 20+ warehouse collaborations, we have grown into a trusted all-in-one logistics provider.
              </p>
              <p>
                Our mission is to deliver fast, safe, and efficient transportation services, connecting businesses and families across Gujarat while keeping the state moving forward.
              </p>
            </div>

            <div className="lg:w-1/2 w-full flex justify-center">
              <div className="relative w-full max-w-md h-[450px] rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src="/founder.jpg" 
                  alt="Founder of Gayatri Agency"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#113741]/90 via-[#113741]/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white">Sarthak</h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- SHARED FOOTER --- */}
      <footer className="bg-[#113741] text-slate-400 py-12 text-center mt-auto border-t border-white/10">
        <div className="flex items-center justify-center gap-3 mb-4">
         <img src="/android-chrome-192x192.png" alt="Gayatri Agency Logo" 
         className="w-8 h-8 object-contain invert mix-blend-screen opacity-90 [clip-path:inset(2px)]" />
           <span className="font-extrabold tracking-widest text-white text-sm uppercase">Gayatri Agency</span>
        </div>
        <p className="text-[10px] tracking-widest text-white/40 uppercase">© {new Date().getFullYear()} ALL RIGHTS RESERVED.</p>
      </footer>

      {/* --- DESKTOP REQUIRED LOCK SCREEN --- */}
      {showMobileWarning && (
        <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center h-full w-full">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">💻</div>
          <h1 className="text-3xl font-black text-[#113741] mb-4">Desktop Required</h1>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-xs mx-auto">
            The Gayatri ERP system contains complex data tables and management tools optimized for larger screens. Please log in from a computer or tablet.
          </p>
          <button 
            onClick={() => setShowMobileWarning(false)}
            className="bg-[#113741] text-white px-10 py-4 rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-teal-900 transition shadow-lg w-full max-w-xs"
          >
            Return to Page
          </button>
        </div>
      )}

    </div>
  );
}