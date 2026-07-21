"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Platform } from "@prisma/client";
import { apiFetch } from "@/lib/api";
import type { MarketplaceData } from "@/lib/types";

export function useMarketplace() {
  return useQuery({
    queryKey: ["marketplace"],
    queryFn: () => apiFetch<MarketplaceData>("/api/marketplace"),
  });
}

export function useSyncMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (platform: Platform) =>
      apiFetch("/api/marketplace/sync", {
        method: "POST",
        body: JSON.stringify({ platform }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}
