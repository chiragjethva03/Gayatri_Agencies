"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeePage from "@/components/employee/EmployeePage";
import LockPasswordModal from "@/components/ui/LockPasswordModal";

export default function Page() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);

  return (
    <>
      <LockPasswordModal
        isOpen={!unlocked}
        title="Employee Corner"
        description="Employee records are protected. Enter the admin password to access this section."
        onUnlock={() => setUnlocked(true)}
        onCancel={() => router.push("/dashboard")}
      />
      {unlocked && <EmployeePage />}
    </>
  );
}
