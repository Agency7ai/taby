import { EAppearance, EPopupWindow, EScroll, EStorage } from "../type/misc.ts";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

function useSettings() {
  const [theme, setTheme] = useState(EAppearance.Light);
  const [popupFixed, setPopupFixed] = useState(EPopupWindow.UnFixed);
  const [scroll, setScroll] = useState<EScroll>(EScroll.Default);
  const [openAIKey, setOpenAIKey] = useState<string>("");
  const [enableCategorization, setEnableCategorization] =
    useState<boolean>(false);

  const handleSettings = async (
    changes: Record<string, browser.Storage.StorageChange>,
  ) => {
    for (const [key, { newValue }] of Object.entries(changes)) {
      if (key === EStorage.Appearance) {
        setTheme(newValue as EAppearance);
      } else if (key === EStorage.PopupWindow) {
        setPopupFixed(newValue as EPopupWindow);
      } else if (key === EStorage.Scroll) {
        setScroll(newValue as EScroll);
      } else if (key === EStorage.OpenAIKey) {
        setOpenAIKey(newValue as string);
      } else if (key === EStorage.EnableCategorization) {
        setEnableCategorization(newValue as boolean);
      }
    }
  };

  useEffect(() => {
    browser.storage.local
      .get([
        EStorage.Appearance,
        EStorage.PopupWindow,
        EStorage.Scroll,
        EStorage.OpenAIKey,
        EStorage.EnableCategorization,
      ])
      .then((storage) => {
        setTheme(storage[EStorage.Appearance] as EAppearance);
        setPopupFixed(storage[EStorage.PopupWindow] as EPopupWindow);
        setScroll(storage[EStorage.Scroll] as EScroll);
        setOpenAIKey((storage[EStorage.OpenAIKey] as string) || "");
        setEnableCategorization(
          (storage[EStorage.EnableCategorization] as boolean) || false,
        );
      });

    browser.storage.onChanged.addListener(handleSettings);

    return () => {
      browser.storage.onChanged.removeListener(handleSettings);
    };
  }, []);

  return {
    theme,
    popupFixed,
    scroll,
    openAIKey,
    enableCategorization,
  };
}

export default useSettings;
