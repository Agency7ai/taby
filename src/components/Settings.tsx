import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import {
  handleSelectAppearance,
  handleSelectPopupWindow,
  handleSelectScroll,
  handleSelectOpenAIKey,
  handleSelectEnableCategorization,
} from "~/lib/storage";
import { EAppearance, EPopupWindow, EStorage, EScroll } from "~/type/misc";

function Settings() {
  const [theme, setTheme] = useState<EAppearance>(EAppearance.Light);
  const [isFixed, setIsFixed] = useState<EPopupWindow>(EPopupWindow.Fixed);
  const [scroll, setScroll] = useState<EScroll>(EScroll.Default);
  const [openAIKey, setOpenAIKey] = useState<string>("");
  const [enableCategorization, setEnableCategorization] =
    useState<boolean>(false);

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
        setTheme(
          (storage[EStorage.Appearance] as EAppearance) || EAppearance.Light,
        );
        setIsFixed(
          (storage[EStorage.PopupWindow] as EPopupWindow) ||
            EPopupWindow.UnFixed,
        );
        setScroll((storage[EStorage.Scroll] as EScroll) || EScroll.Default);
        setOpenAIKey((storage[EStorage.OpenAIKey] as string) || "");
        setEnableCategorization(
          (storage[EStorage.EnableCategorization] as boolean) || false,
        );
      });
  }, []);

  const updateTheme = async (value: EAppearance) => {
    setTheme(value);
    await handleSelectAppearance(value);
  };

  const updateIsFixed = async (value: EPopupWindow) => {
    setIsFixed(value);
    await handleSelectPopupWindow(value);
  };

  const updateScroll = async (value: EScroll) => {
    setScroll(value);
    await handleSelectScroll(value);
  };

  const updateOpenAIKey = async (value: string) => {
    setOpenAIKey(value);
    await handleSelectOpenAIKey(value);
  };

  const updateEnableCategorization = async (value: boolean) => {
    setEnableCategorization(value);
    await handleSelectEnableCategorization(value);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <h1 className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-2xl font-bold text-transparent drop-shadow-sm dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
          General
        </h1>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between space-x-4">
            <Label
              htmlFor="theme-select"
              className="font-semibold text-slate-700 dark:text-slate-300"
            >
              Theme
            </Label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => updateTheme(e.target.value as EAppearance)}
              className="w-[180px] rounded-xl border border-white/40 bg-gradient-to-br from-white/80 to-white/60 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-blue-400/50 focus:outline-none dark:border-white/10 dark:from-slate-700/60 dark:to-slate-800/50 dark:text-slate-200"
            >
              <option value={EAppearance.Light}>Light</option>
              <option value={EAppearance.Dark}>Dark</option>
              <option value={EAppearance.DeepCharcoal}>Deep Charcoal</option>
              <option value={EAppearance.MidnightBlue}>Midnight Blue</option>
              <option value={EAppearance.VioletAbyss}>Violet Abyss</option>
            </select>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose between light and dark mode for the application interface.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between space-x-4">
            <Label
              htmlFor="scroll-select"
              className="font-semibold text-slate-700 dark:text-slate-300"
            >
              Scroll Behavior
            </Label>
            <select
              id="scroll-select"
              value={scroll}
              onChange={(e) => updateScroll(e.target.value as EScroll)}
              className="w-[180px] rounded-xl border border-white/40 bg-gradient-to-br from-white/80 to-white/60 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-blue-400/50 focus:outline-none dark:border-white/10 dark:from-slate-700/60 dark:to-slate-800/50 dark:text-slate-200"
            >
              <option value={EScroll.Default}>Default</option>
              <option value={EScroll.Reversed}>Reversed</option>
            </select>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose the scrolling behavior for the application.
          </p>
        </div>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="border-gradient-to-r w-full border-t from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="rounded-full bg-gradient-to-br from-white/90 to-white/70 px-4 text-xs text-slate-500 shadow-sm backdrop-blur-sm dark:from-slate-900/90 dark:to-slate-800/70">
              •••
            </span>
          </div>
        </div>

        <h1 className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-2xl font-bold text-transparent drop-shadow-sm dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
          Popup
        </h1>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-white/30 bg-gradient-to-br from-white/60 to-white/40 p-4 shadow-md backdrop-blur-sm dark:border-white/10 dark:from-slate-800/40 dark:to-slate-700/30">
            <Label
              htmlFor="fixed-mode"
              className="font-semibold text-slate-700 dark:text-slate-300"
            >
              Fixed Popup
            </Label>
            <Switch
              id="fixed-mode"
              checked={isFixed === EPopupWindow.Fixed}
              onCheckedChange={(checked) => {
                updateIsFixed(
                  checked ? EPopupWindow.Fixed : EPopupWindow.UnFixed,
                );
              }}
            />
          </div>
          <p className="px-1 text-sm text-slate-600 dark:text-slate-400">
            Fixed displays the popup at its maximum size. Floating displays the
            popup at its minimum size.
          </p>
        </div>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="border-gradient-to-r w-full border-t from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="rounded-full bg-gradient-to-br from-white/90 to-white/70 px-4 text-xs text-slate-500 shadow-sm backdrop-blur-sm dark:from-slate-900/90 dark:to-slate-800/70">
              •••
            </span>
          </div>
        </div>

        <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent drop-shadow-sm dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
          AI Ideas
        </h1>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-blue-200/40 bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-pink-50/40 p-4 shadow-md backdrop-blur-sm dark:border-blue-700/20 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/10">
            <Label
              htmlFor="enable-categorization"
              className="font-semibold text-slate-700 dark:text-slate-300"
            >
              Enable AI Ideas
            </Label>
            <Switch
              id="enable-categorization"
              checked={enableCategorization}
              onCheckedChange={(checked) => {
                updateEnableCategorization(checked);
              }}
            />
          </div>
          <p className="px-1 text-sm text-slate-600 dark:text-slate-400">
            Get AI-powered suggestions based on your open tabs.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <Label
            htmlFor="openai-key"
            className="font-semibold text-slate-700 dark:text-slate-300"
          >
            OpenAI API Key
          </Label>
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-sm"></div>
            <input
              id="openai-key"
              type="password"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              onBlur={(e) => updateOpenAIKey(e.target.value)}
              placeholder="sk-..."
              className="relative w-full rounded-xl border border-white/40 bg-gradient-to-br from-white/80 to-white/60 px-4 py-3 text-sm font-medium text-slate-700 placeholder-slate-400 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:shadow-xl focus:ring-2 focus:ring-purple-400/50 focus:outline-none dark:border-white/10 dark:from-slate-700/60 dark:to-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
          <p className="px-1 text-sm text-slate-600 dark:text-slate-400">
            Enter your OpenAI API key. Get one at{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 underline transition-colors hover:text-purple-600 dark:text-blue-400 dark:hover:text-purple-400"
            >
              platform.openai.com
            </a>
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

export default Settings;
