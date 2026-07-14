"use client";

import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext({ role: "admin", isDemo: false });

export function UserProvider({ children }) {
  const [role, setRole] = useState("admin");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setRole(d.role || "admin"))
      .catch(() => setRole("admin"));
  }, []);

  return (
    <UserContext.Provider value={{ role, isDemo: role === "demo" }}>
      {children}
    </UserContext.Provider>
  );
}

/** Returns { role, isDemo } for any client component. */
export function useUser() {
  return useContext(UserContext);
}
