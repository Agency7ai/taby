import { OpenAIService } from "./openai.ts";
import browser from "webextension-polyfill";
import { TCategoryCache, TGroupedTabs } from "~/type/categorization.ts";
import { ECategory, EStorage } from "~/type/misc.ts";
import { TTab } from "~/type/tab.tsx";

const CACHE_TTL_MS = 15 * 60 * 1000;

export class CategorizationService {
  private static generateCacheKey(
    type: "tabs" | "bookmarks" | "history",
  ): string {
    return `${EStorage.CategoriesCache}_${type}`;
  }

  static async getCachedCategories(
    type: "tabs" | "bookmarks" | "history",
  ): Promise<Map<string, ECategory> | null> {
    try {
      const cacheKey = this.generateCacheKey(type);
      const storage = await browser.storage.local.get(cacheKey);
      const cache = storage[cacheKey] as TCategoryCache | undefined;

      if (!cache) return null;

      const now = Date.now();
      if (now - cache.timestamp > CACHE_TTL_MS) {
        await browser.storage.local.remove(cacheKey);
        return null;
      }

      return new Map(Object.entries(cache.categories));
    } catch (error) {
      console.error("Error reading category cache:", error);
      return null;
    }
  }

  static async setCachedCategories(
    type: "tabs" | "bookmarks" | "history",
    categories: Map<string, ECategory>,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(type);
      const cache: TCategoryCache = {
        timestamp: Date.now(),
        categories: Object.fromEntries(categories),
        type,
      };
      await browser.storage.local.set({ [cacheKey]: cache });
    } catch (error) {
      console.error("Error writing category cache:", error);
    }
  }

  static async categorizeTabs(
    tabs: TTab[],
    type: "tabs" | "bookmarks" | "history",
  ): Promise<TTab[]> {
    try {
      const settings = await browser.storage.local.get([
        EStorage.EnableCategorization,
        EStorage.OpenAIKey,
      ]);

      if (!settings[EStorage.EnableCategorization]) {
        return tabs;
      }

      const apiKey = settings[EStorage.OpenAIKey] as string | undefined;
      if (!apiKey || !OpenAIService.isValidApiKey(apiKey)) {
        console.warn("Invalid or missing OpenAI API key");
        return tabs;
      }

      const cachedCategories = await this.getCachedCategories(type);
      if (cachedCategories) {
        return tabs.map((tab) => ({
          ...tab,
          category: cachedCategories.get(tab.url) || ECategory.Other,
        }));
      }

      const openai = new OpenAIService(apiKey);
      const request = {
        items: tabs.map((tab, idx) => ({
          idx,
          title: tab.title,
          url: tab.url,
        })),
      };

      const response = await openai.categorizeTabs(request);

      const categoryMap = new Map<string, ECategory>();
      response.categories.forEach(({ idx, category }) => {
        if (tabs[idx]) {
          categoryMap.set(tabs[idx].url, category);
        }
      });

      await this.setCachedCategories(type, categoryMap);

      return tabs.map((tab) => ({
        ...tab,
        category: categoryMap.get(tab.url) || ECategory.Other,
      }));
    } catch (error) {
      console.error("Categorization error:", error);
      return tabs;
    }
  }

  static groupTabsByCategory(tabs: TTab[]): TGroupedTabs[] {
    const groups = new Map<ECategory, TTab[]>();

    tabs.forEach((tab) => {
      const category = tab.category || ECategory.Other;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(tab);
    });

    const categoryOrder = [
      ECategory.Development,
      ECategory.Research,
      ECategory.Productivity,
      ECategory.Communication,
      ECategory.Social,
      ECategory.News,
      ECategory.Shopping,
      ECategory.Entertainment,
      ECategory.Other,
    ];

    return categoryOrder
      .filter((category) => groups.has(category))
      .map((category) => ({
        category,
        tabs: groups.get(category)!,
      }));
  }
}
