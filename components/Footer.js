"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center gap-3 text-center">
        
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-gray-800">ERP Solution</span>.  
          All rights reserved. Developed by{" "}
          <a
            href="https://www.kncfuturetech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium"
          >
            KnC Future Tech
          </a>
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/privacy-policy" className="hover:text-gray-900 transition">
            Privacy Policy
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/terms" className="hover:text-gray-900 transition">
            Terms & Conditions
          </Link>
        </div>

      </div>
    </footer>
  );
}
