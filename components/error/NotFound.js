"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex items-center justify-center w-full min-h-[60vh] bg-white mt-30">
      <div className="text-center px-4">

        <h1 className="mb-4 text-8xl md:text-9xl font-extrabold text-blue-600">
          404
        </h1>

        <h2 className="mb-3 text-2xl md:text-4xl font-bold text-gray-900">
          Something&apos;s missing.
        </h2>

        <p className="mb-6 text-base md:text-lg text-gray-500">
          Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home page.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </Link>

      </div>
    </section>
  );
}
