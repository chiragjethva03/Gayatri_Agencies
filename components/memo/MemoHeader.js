import MemoActions from "./MemoActions";

export default function MemoHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h1 className="text-lg font-semibold">List of Memo</h1>
      <MemoActions />
    </div>
  );
}
