"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useShop } from "~/hooks/useShop";

type ShopContextType = ReturnType<typeof useShop>;

const ShopContext = createContext<ShopContextType | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const shop = useShop();

  return <ShopContext.Provider value={shop}>{children}</ShopContext.Provider>;
}

export function useShopContext() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShopContext must be used within a ShopProvider");
  }
  return context;
}
