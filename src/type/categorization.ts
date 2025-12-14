import { ECategory } from "./misc.ts";
import { TTab } from "./tab.tsx";

export interface TCategorizationRequest {
  items: Array<{
    idx: number;
    title: string;
    url: string;
  }>;
}

export interface TCategorizationResponse {
  categories: Array<{
    idx: number;
    category: ECategory;
  }>;
}

export interface TCategoryCache {
  timestamp: number;
  categories: Record<string, ECategory>;
  type: "tabs" | "bookmarks" | "history";
}

export interface TGroupedTabs {
  category: ECategory;
  tabs: TTab[];
}
