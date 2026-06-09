"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMasterMe, type MasterMeResponse, type MasterStatus } from "@/lib/api/copier";

type MasterProfileContextValue = {
  data: MasterMeResponse | null;
  status: MasterStatus;
  loading: boolean;
  refetch: () => Promise<void>;
  applyMasterMe: (next: MasterMeResponse) => void;
};

const MasterProfileContext = createContext<MasterProfileContextValue>({
  data: null,
  status: "none",
  loading: true,
  refetch: async () => {},
  applyMasterMe: () => {},
});

export function MasterProfileProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MasterMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const applyMasterMe = useCallback((next: MasterMeResponse) => {
    setData(next);
    setLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    try {
      const result = await fetchMasterMe();
      setData(result);
    } catch {
      setData({ status: "none" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const status = data?.status ?? "none";

  return (
    <MasterProfileContext.Provider value={{ data, status, loading, refetch, applyMasterMe }}>
      {children}
    </MasterProfileContext.Provider>
  );
}

export function useMasterProfile() {
  return useContext(MasterProfileContext);
}
