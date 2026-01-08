import MemoActions from "./MemoActions";

export default function MemoHeader({ transport }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-lg font-semibold">
      
        {transport?.name && (
          <span className="ml-2 text-sm font-medium text-slate-500">
            – {transport.name}
          </span>
        )}
      </h1>

      <MemoActions transport={transport} />
    </div>
  );
}
