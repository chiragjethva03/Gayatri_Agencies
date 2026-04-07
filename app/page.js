"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Montserrat } from "next/font/google";

// --- IMPORTING THE EXACT FONT ---
const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"] 
});

// --- CUSTOM TYPEWRITER COMPONENT ---
const TypewriterText = () => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const phrases = [
    "Trusted C&F Services",
    "Smart Warehousing Solutions",
    "Fast & Secure Deliveries"
  ];

  useEffect(() => {
    let timer = setTimeout(() => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <span className="text-gray-500 font-medium tracking-wide">
      {text}
      <span className="animate-pulse text-gray-400">|</span>
    </span>
  );
};

// --- CUSTOM MARQUEE ITEM ---
const MarqueeItem = ({ text }) => (
  <div className="flex items-center mx-6 md:mx-12">
    {/* Thick Diagonal Arrow */}
    <svg className="w-5 h-5 md:w-8 md:h-8 text-[#f38118] mr-3 md:mr-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 5h13v13h-3.5V10.5L6.5 19.5 4 17l9-9H6V5z" />
    </svg>
    {/* Transparent Watermark Text */}
    <span className="text-2xl md:text-4xl font-black text-white/10 tracking-widest uppercase">
      {text}
    </span>
  </div>
);

export default function Home() {
  const router = useRouter();
  
  // State for Mobile Menu and Lock Screen
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const handleComingSoon = (e) => {
    e.preventDefault();
    alert("Coming Soon! We are actively working on this feature.");
  };

  // --- NEW: MOBILE CHECK FOR LOGIN ---
  const handleLoginClick = (e) => {
    e.preventDefault();
    // Check if the screen width is less than a standard tablet/desktop (768px)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
      setShowMobileWarning(true); // Show the lock screen overlay
    } else {
      router.push("/login"); // Route normally on larger screens
    }
  };

  return (
    <div className={`min-h-screen bg-white ${montserrat.className} text-slate-800 overflow-x-hidden relative`}>
      
      {/* CSS FOR INFINITE SCROLLING MARQUEE */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* --- NAVIGATION BAR --- */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            
            {/* Logo & Brand - ADDED MIX BLEND MULTIPLY HERE */}
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
              <a href="#" className="text-[13px] text-[#113741] font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Home
              </a>
              <Link href="/about" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition-colors uppercase">
                About Us
              </Link>
              <Link href="/inquiry" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Inquiry 
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
              
              {/* Mobile Hamburger Icon */}
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
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-[#113741] font-bold tracking-widest uppercase">
              Home
            </a>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest hover:text-orange-500 transition-colors uppercase block">
              About Us
              </Link>
            <Link href="/inquiry" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Inquiry 
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
{/* --- REFINED HERO SECTION --- */}
      <header className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-10 shadow-sm">
          <span>📦</span> C&F and Transport Experts
        </div>

        <div className="relative mb-12">
          <h1 className="text-[12vw] md:text-[8rem] font-black leading-[0.8] tracking-tighter uppercase mb-4">
            GAYATRI <span></span> AGENCY
          </h1>
          <div className="h-6 mt-4">
            <TypewriterText />
          </div>
        </div>

        {/* CENTERED STATS BOX */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-y border-gray-100 py-10 max-w-4xl mx-auto mt-20">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-500/20">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <div className="text-left">
              <span className="text-5xl font-black block leading-none">90K+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Monthly Goods</span>
            </div>
          </div>
          <div className="hidden md:block w-[1px] h-12 bg-gray-200"></div>
          <p className="max-w-xs text-sm font-medium leading-relaxed opacity-70">
            Reliable C&F and logistics solutions delivering efficiency across Gujarat for over 28 years.
          </p>
        </div>
      </header>

      {/* --- STRICTLY STACKED FULL WIDTH SECTION --- */}
      <div className="w-full flex flex-col bg-[#0c2229]">
        
        {/* 1. The Video */}
        <video 
          src="/truck-video.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-[35vh] md:h-[65vh] object-cover object-center"
        />
        
        {/* 2. The Blue Blur Part */}
        <div className="w-full h-[40px] md:h-[90px] bg-gradient-to-b from-[#113741]/80 to-[#0c2229] backdrop-blur-md shadow-[0_-10px_20px_rgba(12,34,41,0.5)] z-10"></div>
        
        {/* 3. The Moving Customer Line */}
        <div className="w-full bg-[#0c2229] py-4 md:py-8 overflow-hidden z-20">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center">
                <MarqueeItem text="SUPPLY CHAIN" />
                <MarqueeItem text="CUSTOMER SUPPORT" />
                <MarqueeItem text="EXPRESS DELIVERY" />
                <MarqueeItem text="TRANSPORT & LOGISTICS" />
              </div>
            ))}
            
          </div>
        </div>

      </div>

      {/* --- ABOUT US SECTION --- */}
      <section id="about" className="py-16 md:py-32 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-[#113741] mb-4 md:mb-6">Who we are ?</h2>
          <div className="w-16 h-[2px] bg-gray-300 mx-auto mb-6 md:mb-8"></div>
          <p className="text-gray-500 text-sm md:text-[15px] max-w-3xl mx-auto leading-relaxed">
            Gayatri Agency, Ahmedabad based transportation agency, offers reliable transportation and courier services, ensuring fast, safe, and efficient deliveries across gujarat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-32">
          <div className="pr-0 md:pr-4">
            <h3 className="text-xl font-bold text-[#113741] mb-4 md:mb-6">Our Story & Vision</h3>
            <p className="text-gray-500 text-[13px] md:text-[14px] mb-4 md:mb-6 leading-loose text-justify">
              Founded in 1997, Gayatri Agency began as a small warehousing and transport service in Ahmedabad. With over 28 years of experience, 45+ transport partnerships, and 20+ warehouse collaborations, we've built a reputation for trust and reliability. Today, we proudly offer all-in-one logistics services under one roof.
            </p>
            <p className="text-gray-500 text-[13px] md:text-[14px] leading-loose text-justify">
              Our mission is simple: to provide fast, safe, and affordable transportation services that connect businesses and families across Gujarat. We take pride in being the bridge that keeps Gujarat moving forward.
            </p>
          </div>
          
          <div className="relative pl-0 md:pl-8 mt-6 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Fleet" 
              className="rounded-2xl shadow-xl w-full object-cover h-[280px] md:h-[380px]"
            />
            {/* Adjusted position for mobile to prevent overflow */}
            <div className="absolute -bottom-6 left-4 md:-bottom-8 md:left-0 bg-white p-5 md:p-7 shadow-2xl rounded-2xl border border-gray-100 text-center w-36 md:w-44 z-10">
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 md:mb-2">Serving More<br/>Than</p>
              <p className="text-3xl md:text-4xl font-bold text-[#113741]">28+</p>
              <p className="text-[10px] md:text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1 md:mt-2">Years</p>
            </div>
          </div>
        </div>

        <div className="mt-20 md:mt-32">
          <h3 className="text-2xl md:text-3xl font-bold text-[#113741] text-center mb-4 md:mb-6">Why Choose Gayatri Agency ?</h3>
          <div className="w-20 h-[2px] bg-[#113741] mx-auto mb-10 md:mb-16"></div>
          
          <div className="grid sm:grid-cols-2 gap-y-8 gap-x-10 md:gap-x-16 text-sm md:text-[15px] text-gray-600 max-w-4xl mx-auto">
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-orange-500 text-lg md:text-xl mt-0.5">•</span> 
              <p className="leading-relaxed">Local expertise with deep understanding of Gujarat routes</p>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-orange-500 text-lg md:text-xl mt-0.5">•</span> 
              <p className="leading-relaxed">State-of-the-art tracking and communication systems</p>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-orange-500 text-lg md:text-xl mt-0.5">•</span> 
              <p className="leading-relaxed">Competitive pricing with transparent cost structure</p>
            </div>
            <div className="flex items-start gap-3 md:gap-4">
              <span className="text-orange-500 text-lg md:text-xl mt-0.5">•</span> 
              <p className="leading-relaxed">24/7 customer support and real-time updates</p>
            </div>
          </div>
        </div>
      </section>
<footer className="bg-[#113741] text-slate-400 py-12 text-center mt-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="/android-chrome-192x192.png"
            alt="Gayatri Agency Logo"
            className="w-8 h-8 object-contain invert mix-blend-screen opacity-90 [clip-path:inset(2px)]"
          />
          <span className="font-extrabold tracking-widest text-white text-sm uppercase">
            Gayatri Agency
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <a
            href="/terms"
            className="text-[11px] tracking-widest text-white/50 uppercase hover:text-white transition-colors duration-200"
          >
            Terms &amp; Conditions
          </a>
          <span className="text-white/20 text-xs">|</span>
          <a
            href="/privacy-policy"
            className="text-[11px] tracking-widest text-white/50 uppercase hover:text-white transition-colors duration-200"
          >
            Privacy Policy
          </a>
        </div>

        <p className="text-[10px] tracking-widest text-white/40 uppercase">
          © {new Date().getFullYear()} ALL RIGHTS RESERVED.
        </p>
      </footer>

      {/* --- DESKTOP REQUIRED LOCK SCREEN (MOBILE ONLY) --- */}
      {showMobileWarning && (
        <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center h-full w-full">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">
            💻
          </div>
          <h1 className="text-3xl font-black text-[#113741] mb-4">Desktop Required</h1>
          <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-xs mx-auto">
            The Gayatri ERP system contains complex data tables and management tools optimized for larger screens. Please log in from a computer or tablet.
          </p>
          <button 
            onClick={() => setShowMobileWarning(false)}
            className="bg-[#113741] text-white px-10 py-4 rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-teal-900 transition shadow-lg w-full max-w-xs"
          >
            Return to Home
          </button>
        </div>
      )}

    </div>
  );
}