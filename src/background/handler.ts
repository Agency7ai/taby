import { CategorizationService } from "../lib/categorization.ts";
import { TTab } from "../type/tab.tsx";
import { flattenBookmarkTreeNode } from "./misc.ts";
import Fuse from "fuse.js";
import browser from "webextension-polyfill";

export const handleDuplicateTab = async function () {
  const [currentTab] = await browser.tabs.query({ active: true });
  await browser.tabs.create({ url: currentTab.url });
};

export const handleRequestSwitchTab = async function (tab: TTab) {
  await browser.tabs.update(tab.id || undefined, { active: true });
};

export interface THandleRequestUpdateCurrentTab {
  newTab: boolean;
}

export const handleRequestUpdateCurrentTab = async function (
  tab: TTab,
  options: THandleRequestUpdateCurrentTab,
) {
  if (options.newTab) {
    await browser.tabs.create({
      url: tab.url,
    });
  } else {
    await browser.tabs.update(tab.id || undefined, { url: tab.url });
  }
};

export const handleRequestSearchOpenTabs = async function (
  content: string,
): Promise<TTab[]> {
  const tabs = (await browser.tabs.query({ lastFocusedWindow: true })).filter(
    (tab) => tab.url !== "about:firefoxview" && tab.title !== "Firefox View",
  );

  let tabResults: TTab[];

  if (content === "") {
    tabResults = tabs.map(TTab.fromTab);
  } else {
    const options = {
      keys: ["title", "url", "key"],
    };
    const fuse = new Fuse(tabs.map(TTab.fromTab), options);
    tabResults = fuse.search(content).map(function (tab, idx) {
      return {
        ...tab.item,
        idx,
      };
    });
  }

  return await CategorizationService.categorizeTabs(tabResults, "tabs");
};

export const handleRequestSearchBookmarks = async function (
  content: string,
): Promise<TTab[]> {
  const bookmarks = flattenBookmarkTreeNode(await browser.bookmarks.getTree());

  let bookmarkResults: TTab[];

  if (content === "") {
    bookmarkResults = bookmarks.map((bookmark, idx) =>
      TTab.fromBookmark(bookmark, idx),
    );
  } else {
    const options = {
      keys: ["title", "url"],
    };
    const fuse = new Fuse(bookmarks, options);
    bookmarkResults = fuse.search(content).map(function (bookmark, idx): TTab {
      return TTab.fromBookmark(bookmark.item, idx);
    });
  }

  return await CategorizationService.categorizeTabs(
    bookmarkResults,
    "bookmarks",
  );
};

export const handleRequestSearchHistory = async function (
  content: string,
): Promise<TTab[]> {
  const history = await browser.history.search({
    text: "",
    maxResults: 10000,
    startTime: 0,
  });

  let historyResults: TTab[];

  if (content === "") {
    historyResults = history.map((history, idx) =>
      TTab.fromHistory(history, idx),
    );
  } else {
    const options = {
      keys: ["title", "url"],
    };
    const fuse = new Fuse(history, options);
    historyResults = fuse.search(content).map(function (history, idx): TTab {
      return TTab.fromHistory(history.item, idx);
    });
  }

  return await CategorizationService.categorizeTabs(historyResults, "history");
};
