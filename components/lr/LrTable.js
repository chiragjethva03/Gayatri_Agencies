import LrRow from "./LrRow";

const MOCK_LRS = []; // later from API

export default function LrTable({ selectedLrs, setSelectedLrs }) {
  const toggleLr = (lr) => {
    setSelectedLrs((prev) =>
      prev.find((x) => x.id === lr.id)
        ? prev.filter((x) => x.id !== lr.id)
        : [...prev, lr]
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th></th>
            <th>LR No</th>
            <th>From City</th>
            <th>To City</th>
            <th>Weight</th>
          </tr>
        </thead>

        <tbody>
          {MOCK_LRS.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-6 text-gray-500">
                No records available
              </td>
            </tr>
          )}

          {MOCK_LRS.map((lr) => (
            <LrRow
              key={lr.id}
              lr={lr}
              checked={selectedLrs.some((x) => x.id === lr.id)}
              onToggle={() => toggleLr(lr)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
