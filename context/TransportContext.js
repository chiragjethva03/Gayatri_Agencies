"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TransportContext = createContext({ transports: [], fetchTransports: async () => {} });

export function TransportProvider({ children }) {
  const [transports, setTransports] = useState([]);

  const fetchTransports = async () => {
    const res = await fetch("/api/transports");
    const data = await res.json();
    setTransports(data || []);
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  return (
    <TransportContext.Provider value={{ transports, fetchTransports }}>
      {children}
    </TransportContext.Provider>
  );
}

export const useTransports = () => useContext(TransportContext);