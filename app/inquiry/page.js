"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { toast, Toaster } from "react-hot-toast"; // --- NEW: Imported Toast ---

const montserrat = Montserrat({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800", "900"] 
});

export default function InquiryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    country: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED: Connects to the Inquiry API and triggers Toast ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Inquiry sent successfully!");
        setIsSuccess(true);
        setFormData({ fullName: "", email: "", companyName: "", country: "", description: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast.error("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Check your connection.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      
      {/* --- NEW: Add the Toaster Component --- */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- RESPONSIVE SHARED NAVIGATION BAR --- */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 md:h-24 items-center">
            
            {/* Logo & Brand */}
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
              <Link href="/about" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                About Us
              </Link>
              <Link href="/inquiry" className="text-[13px] text-[#113741] font-bold tracking-widest hover:text-orange-500 transition uppercase">
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
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Home
            </Link>
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              About Us
            </Link>
            <Link href="/inquiry" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-[#113741] font-bold tracking-widest uppercase">
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

      {/* --- INQUIRY FORM SECTION --- */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 md:py-24 relative">
        <div className="absolute top-10 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-10 left-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50 -z-10"></div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-[#113741] mb-4 tracking-tight">Business Inquiry</h1>
          <div className="w-16 h-1 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Interested in our C&F, transportation, or warehousing services? Fill out the form below and our team will get back to you with a customized solution.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
          {isSuccess ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
              <h2 className="text-3xl font-bold text-[#113741] mb-2">Inquiry Sent!</h2>
              <p className="text-gray-500">Thank you for reaching out. We will review your details and contact you shortly.</p>
              <button onClick={() => setIsSuccess(false)} className="mt-8 text-orange-500 font-bold hover:underline">
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-[#113741] mb-2 uppercase tracking-wide">Full Name <span className="text-orange-500">*</span></label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-[#113741] mb-2 uppercase tracking-wide">Email Address <span className="text-orange-500">*</span></label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@company.com" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-[#113741] mb-2 uppercase tracking-wide">Company Name <span className="text-orange-500">*</span></label>
                  <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="Your Company Ltd." className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-[#113741] mb-2 uppercase tracking-wide">Country <span className="text-orange-500">*</span></label>
                  <select name="country" required value={formData.country} onChange={handleChange} className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition appearance-none">
                    <option value="" disabled>Select your country</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-[#113741] mb-2 uppercase tracking-wide">Description <span className="text-orange-500">*</span></label>
                <textarea name="description" required value={formData.description} onChange={handleChange} rows="5" placeholder="Tell us about your logistics requirements, estimated volumes, and routes..." className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition resize-none"></textarea>
              </div>

              <div className="pt-4 text-center">
                <button disabled={isSubmitting} type="submit" className="w-full md:w-auto bg-orange-500 text-white px-12 py-4 rounded-md font-bold tracking-widest uppercase hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Sending Inquiry..." : "Send Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-[#113741] text-slate-400 py-12 text-center mt-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
<img src="/android-chrome-192x192.png" alt="Gayatri Agency Logo" className="w-8 h-8 object-contain invert mix-blend-screen opacity-90 [clip-path:inset(2px)]" />           <span className="font-extrabold tracking-widest text-white text-sm uppercase">Gayatri Agency</span>
        </div>
        <p className="text-[10px] tracking-widest text-white/40 uppercase">© {new Date().getFullYear()} ALL RIGHTS RESERVED.</p>
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
            Return to Page
          </button>
        </div>
      )}

    </div>
  );
}