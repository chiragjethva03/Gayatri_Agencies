"use client";

export default function ServerError({ onRetry }) {
  return (
    <section className="flex items-center justify-center w-full min-h-[60vh]">
      <div className="text-center px-4">

        <h1 className="mb-4 text-8xl md:text-9xl font-extrabold text-blue-600">
          500
        </h1>

        <h2 className="mb-3 text-2xl md:text-4xl font-bold text-gray-900">
          Internal Server Error
        </h2>

        <p className="mb-6 text-base md:text-lg text-gray-500">
          We are already working to solve the problem.
        </p>

        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Retry
        </button>

      </div>
    </section>
  );
}
