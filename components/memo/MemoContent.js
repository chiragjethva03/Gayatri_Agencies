import MemoHeader from "./MemoHeader";
import MemoFilters from "./MemoFilters";
import MemoTable from "./MemoTable";

export default function MemoPageLayout() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <MemoHeader />
      <MemoFilters />
      <MemoTable />
    </div>
  );
}
