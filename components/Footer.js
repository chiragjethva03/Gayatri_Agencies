"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-10 border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">

    
        <p className="text-sm text-gray-600 mb-2">
          © {new Date().getFullYear()} ERP Solution. All Rights Reserved. Developed By <a href="https://www.kncfuturetech.com/">KnC Future Tech</a> 
        </p>

        {/* Links */}
        <div className="flex justify-center gap-4 text-sm text-gray-700 font-medium">
          <a 
            href="#" 
            className="hover:underline hover:text-gray-900 transition"
          >
            Privacy Policy
          </a>

          <span>|</span>

          <a 
            href="#" 
            className="hover:underline hover:text-gray-900 transition"
          >
            Terms & Conditions
          </a>
        </div>

      </div>
    </footer>
  );
}
