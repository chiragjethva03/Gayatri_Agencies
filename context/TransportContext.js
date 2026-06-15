"use client";
import { createContext, useContext, useEffect, useState } from "react";

const TransportContext = createContext({
  transports:        [],
  transportsLoading: true,
  transportsError:   false,
  fetchTransports:   async () => {},
});

export function TransportProvider({ children }) {
  const [transports,        setTransports]        = useState([]);
  const [transportsLoading, setTransportsLoading] = useState(true);
  const [transportsError,   setTransportsError]   = useState(false);

  // Called once on mount; also callable manually after add/delete/edit.
  const fetchTransports = async () => {
    setTransportsLoading(true);
    setTransportsError(false);
    try {
      const res = await fetch("/api/transports");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTransports(data || []);
    } catch {
      setTransportsError(true);
    } finally {
      setTransportsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransports();
  }, []);

  return (
    <TransportContext.Provider
      value={{ transports, transportsLoading, transportsError, fetchTransports }}
    >
      {children}
    </TransportContext.Provider>
  );
}

export const useTransports = () => useContext(TransportContext);
