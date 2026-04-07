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

export default function ContactUsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNo: "",
    companyName: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPDATED: Connects to the API and triggers Toast ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Message sent successfully!");
        setIsSuccess(true);
        setFormData({ fullName: "", email: "", mobileNo: "", companyName: "", description: "" });
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast.error("Failed to send message. Please try again.");
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
    <div className={`min-h-screen bg-[#f8fafc] ${montserrat.className} text-slate-800 flex flex-col relative overflow-hidden`}>

      {/* --- NEW: Add the Toaster Component --- */}
      <Toaster position="top-center" reverseOrder={false} />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

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
              <Link href="/about" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                About Us
              </Link>
              <Link href="/inquiry" className="text-[13px] text-gray-500 font-bold tracking-widest hover:text-orange-500 transition uppercase">
                Inquiry 
              </Link>
              <Link href="/contactus" className="text-[13px] text-[#113741] font-bold tracking-widest hover:text-orange-500 transition uppercase">
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
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              About Us
            </Link>
            <Link href="/inquiry" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-gray-500 font-bold tracking-widest uppercase">
              Inquiry 
            </Link>
            <Link href="/contactus" onClick={() => setIsMobileMenuOpen(false)} className="text-sm text-[#113741] font-bold tracking-widest uppercase">
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

      {/* --- CONTACT HEADER --- */}
      <div className="pt-20 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-[#113741] mb-6 tracking-tight">Get in Touch</h1>
        <div className="w-16 h-1 bg-orange-500 mx-auto mb-8"></div>
        <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-[15px]">
          Have a question about our services or need immediate support? Send us a message or reach out directly. We're here to help keep your business moving.
        </p>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pb-24">

        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT SIDE: Contact Information Panel */}
          <div className="lg:col-span-2 bg-[#113741] rounded-2xl shadow-xl p-8 md:p-10 text-white flex flex-col h-full">
            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>

            <div className="space-y-8 flex-1">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-widest font-bold mb-1">Call Us</p>
                  <p className="font-medium text-lg">+91 74050-98099</p>
                </div>
              </div>

              <div className="flex items-start gap-4 w-full">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/50 uppercase tracking-widest font-bold mb-1">Email Us</p>
                  <p className="font-medium text-base md:text-lg break-all">gaytriagency170@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-white/50 uppercase tracking-widest font-bold mb-1">Location</p>
                  <p className="font-medium text-[15px] leading-relaxed">
                    Ahmedabad, Gujarat<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-white/60 leading-relaxed">
                Our support team is available Monday through Saturday, 9:00 AM to 7:00 PM IST.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: The Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12">
            {isSuccess ? (
              <div className="text-center py-20 h-full flex flex-col justify-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                <h2 className="text-3xl font-bold text-[#113741] mb-2">Message Sent!</h2>
                <p className="text-gray-500">Thank you for contacting Gayatri Agency. Our team will get back to you shortly.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-8 text-orange-500 font-bold hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#113741] mb-2 uppercase tracking-wider">Full Name <span className="text-orange-500">*</span></label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition text-[15px]" />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#113741] mb-2 uppercase tracking-wider">Email Address <span className="text-orange-500">*</span></label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Enter your email" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition text-[15px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#113741] mb-2 uppercase tracking-wider">Mobile No. <span className="text-orange-500">*</span></label>
                    <input type="tel" name="mobileNo" required value={formData.mobileNo} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition text-[15px]" />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[13px] font-bold text-[#113741] mb-2 uppercase tracking-wider">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your Company Ltd." className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition text-[15px]" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-[13px] font-bold text-[#113741] mb-2 uppercase tracking-wider">Description <span className="text-orange-500">*</span></label>
                  <textarea name="description" required value={formData.description} onChange={handleChange} rows="6" placeholder="How can we help you today?" className="border border-gray-200 bg-gray-50 rounded-lg p-3.5 outline-none focus:ring-2 focus:ring-[#113741]/20 focus:border-[#113741] transition resize-none text-[15px]"></textarea>
                </div>

                <div className="pt-4 text-right">
                  <button disabled={isSubmitting} type="submit" className="w-full md:w-auto bg-[#113741] text-white px-12 py-4 rounded-lg font-bold tracking-widest uppercase hover:bg-teal-900 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </main>

      {/* --- SHARED FOOTER --- */}
      <footer className="bg-[#113741] text-slate-400 py-12 text-center mt-auto border-t border-white/10">
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
            Return to Page
          </button>
        </div>
      )}

    </div>
  );
}