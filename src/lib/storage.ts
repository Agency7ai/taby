import browser from "webextension-polyfill";
import { EAppearance, EPopupWindow, EScroll, EStorage } from "~/type/misc";

export const handleSelectAppearance = async function (theme: EAppearance) {
  await browser.storage.local.set({ [EStorage.Appearance]: theme });
};

export const handleSelectPopupWindow = async function (variant: EPopupWindow) {
  await browser.storage.local.set({ [EStorage.PopupWindow]: variant });
};

export const handleSelectScroll = async function (value: EScroll) {
  await browser.storage.local.set({ [EStorage.Scroll]: value });
};

export const handleSelectOpenAIKey = async function (apiKey: string) {
  await browser.storage.local.set({ [EStorage.OpenAIKey]: apiKey });
};

export const handleSelectEnableCategorization = async function (
  enabled: boolean,
) {
  await browser.storage.local.set({ [EStorage.EnableCategorization]: enabled });

  if (!enabled) {
    await browser.storage.local.remove([
      `${EStorage.CategoriesCache}_tabs`,
      `${EStorage.CategoriesCache}_bookmarks`,
      `${EStorage.CategoriesCache}_history`,
    ]);
  }
};
