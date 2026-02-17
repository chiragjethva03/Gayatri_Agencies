"use client";

export default function LrTopBar() {
  return (
    <div className="flex justify-between items-center mb-2">
      <h1 className="text-lg font-semibold text-gray-800">
        List Of LR
      </h1>

      <div className="flex items-center gap-2">
        <input type="date" className="input" />
        <span className="text-gray-500 text-sm">To</span>
        <input type="date" className="input" />
        <button className="btn-primary">Go</button>

        <input
          placeholder="Fast Search (F1)"
          className="input ml-3 w-56"
        />
      </div>
    </div>
  );
}
