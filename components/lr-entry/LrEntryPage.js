"use client";

import LrEntryHeader from "./LrEntryHeader";
import LrBasicDetails from "./LrBasicDetails";
import LrConsignorConsignee from "./LrConsignorConsignee";
import LrGoodsTable from "./LrGoodsTable";
import LrCharges from "./LrCharges";
import LrFooterActions from "./LrFooterActions";

export default function LrEntryPage() {
  return (
    <div className="p-4 bg-[#F4F6FA]">
      <div className="bg-white rounded-md shadow">

        <LrEntryHeader />

        <div className="p-4 space-y-6">
          <LrBasicDetails />
          <LrConsignorConsignee />
          <LrGoodsTable />
          <LrCharges />
        </div>

        <LrFooterActions />
      </div>
    </div>
  );
}
