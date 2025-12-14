import { ECategory } from "./misc.ts";
import browser, { Bookmarks, History } from "webextension-polyfill";

import BookmarkTreeNode = Bookmarks.BookmarkTreeNode;
import HistoryItem = History.HistoryItem;

export class TTab {
  title: string;
  url: string;
  idx: number;
  id: number | null;
  key: number | null;
  favIconUrl: string | null;
  category?: ECategory;

  constructor(
    title: string,
    url: string,
    idx: number,
    id: number | null,
    key: number | null,
    favIconUrl: string | null,
    category?: ECategory,
  ) {
    this.title = title;
    this.id = id;
    this.key = key;
    this.idx = idx;
    this.url = url;
    this.favIconUrl = favIconUrl;
    this.category = category;
  }

  static fromTab(
    tab: browser.Tabs.Tab,
    index: number,
    category?: ECategory,
  ): TTab {
    return new TTab(
      tab.title || "",
      tab.url || "",
      index,
      tab.id || 0,
      index + 1,
      tab.favIconUrl || "",
      category,
    );
  }

  static fromBookmark(
    bookmark: BookmarkTreeNode,
    idx: number,
    category?: ECategory,
  ): TTab {
    return new TTab(
      bookmark.title || "",
      bookmark.url || "",
      idx,
      null,
      null,
      null,
      category,
    );
  }

  static fromHistory(
    history: HistoryItem,
    idx: number,
    category?: ECategory,
  ): TTab {
    return new TTab(
      history.title || "",
      history.url || "",
      idx,
      null,
      null,
      null,
      category,
    );
  }
}
