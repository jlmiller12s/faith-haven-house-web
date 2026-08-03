"use client";

import { createContext, useContext } from "react";
import { getContentDefaults } from "@/lib/cms/contentRegistry.mjs";

const SiteContentContext = createContext(getContentDefaults());

export function SiteContentProvider({ content, children }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
