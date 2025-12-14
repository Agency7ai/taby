export const enum ESelectedGroup {
  Tab,
  Bookmarks,
  History,
  Settings,
}

export enum EStorage {
  Appearance = "appearance",
  PopupWindow = "popup_window",
  Scroll = "scroll",
  OpenAIKey = "openai_key",
  EnableCategorization = "enable_categorization",
  CategoriesCache = "categories_cache",
}

export enum EPopupWindow {
  Fixed = "fixed",
  UnFixed = "unfixed",
}

export enum EAppearance {
  Light = "light",
  Dark = "dark",
  MidnightBlue = "midnight-blue",
  VioletAbyss = "violet-abyss",
  DeepCharcoal = "deep-charcoal",
}

export enum EScroll {
  Default = "default",
  Reversed = "reversed",
}

export enum ECategory {
  Research = "research",
  Development = "development",
  Entertainment = "entertainment",
  Shopping = "shopping",
  Social = "social",
  Productivity = "productivity",
  News = "news",
  Communication = "communication",
  Other = "other",
}

export const CATEGORY_META: Record<
  ECategory,
  { icon: string; label: string }
> = {
  [ECategory.Research]: { icon: "📚", label: "Research" },
  [ECategory.Development]: { icon: "💻", label: "Development" },
  [ECategory.Entertainment]: { icon: "🎬", label: "Entertainment" },
  [ECategory.Shopping]: { icon: "🛒", label: "Shopping" },
  [ECategory.Social]: { icon: "👥", label: "Social" },
  [ECategory.Productivity]: { icon: "✅", label: "Productivity" },
  [ECategory.News]: { icon: "📰", label: "News" },
  [ECategory.Communication]: { icon: "💬", label: "Communication" },
  [ECategory.Other]: { icon: "📄", label: "Other" },
};
