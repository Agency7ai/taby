import AIIdeas from "./AIIdeas.tsx";
import CommandResults from "./CommandResults.tsx";
import { ChangeEvent, useEffect, useRef } from "react";
import browser from "webextension-polyfill";
import useRefState from "~/hook/useRefState.ts";
import { EMessageFromScriptType, TMessageFromScript } from "~/type/message.ts";
import { EScroll } from "~/type/misc.ts";
import { TTab } from "~/type/tab.tsx";

interface TCommandProps {
  placeholder: string;
  scroll: EScroll;
  searchFunction: (query: string) => Promise<TTab[]>;
  messageType: EMessageFromScriptType;
}

export interface TGoToOptions {
  newTab: boolean;
}

function Command({
  placeholder,
  scroll,
  searchFunction,
  messageType,
}: TCommandProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedElement, setSelectedElement] = useRefState<number | null>(0);
  const [elements, setElements] = useRefState<TTab[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    searchFunction("").then((matched) => {
      console.log("searchFunction");
      setElements(matched);
    });
    inputRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = async (e: KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
        if (selectedElement.current != null) {
          e.preventDefault();
          await goTo(elements.current[selectedElement.current], {
            newTab: e.ctrlKey,
          });
        }
        break;
      case "Escape":
        e.preventDefault();
        window.close();
        break;
      case "0":
        if (e.code === "Numpad0" && selectedElement.current != null) {
          e.preventDefault();
          await closeTab(selectedElement.current);
        }
        break;
    }
  };

  const closeTab = async (visualIdx: number) => {
    // The selected tab from the display (may have re-indexed visual idx)
    const displayTab = elements.current[selectedElement.current ?? visualIdx];

    // Only close if it's an actual tab (has an id)
    if (!displayTab || displayTab.id == null) {
      return;
    }

    try {
      const tabId = displayTab.id;

      // Close the tab by ID
      await browser.tabs.remove(tabId);

      // Small delay to let the browser process the close
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Refresh the search to get updated tab list
      const matched = await searchFunction(inputRef.current?.value || "");
      setElements(matched);

      // Adjust selection after refresh
      if (matched.length === 0) {
        setSelectedElement(null);
      } else if (selectedElement.current != null) {
        // Keep selection at same or previous position
        const newIdx = Math.min(selectedElement.current, matched.length - 1);
        setSelectedElement(newIdx);
      }
    } catch (error) {
      console.error("Failed to close tab:", error);
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const matched = await searchFunction(e.target.value);
      setElements(matched);
      if (matched.length > 0) {
        setSelectedElement(0);
      } else {
        setSelectedElement(null);
      }
    }, 150);
  };

  const goTo = async (tab: TTab, options: TGoToOptions) => {
    const message: TMessageFromScript = {
      type: messageType,
      element: tab,
      newTab: options.newTab,
    };

    await browser.runtime.sendMessage(message);

    window.close();
  };

  return (
    <div
      ref={menuRef}
      className="taby-menu relative flex flex-col overflow-hidden border border-white/20 bg-gradient-to-br from-white/90 via-white/80 to-white/70 antialiased shadow-2xl shadow-black/10 backdrop-blur-xl dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/70"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,255,0.85) 50%, rgba(255,255,255,0.8) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      <div className="relative flex items-center justify-between gap-[16px] border-b border-white/20 bg-white/30 p-[14px] shadow-sm backdrop-blur-sm dark:bg-slate-800/30">
        <input
          className="text-foreground m-0 flex w-full rounded-xl border-0 bg-gradient-to-r from-white/60 to-white/40 p-3 px-4 text-left font-sans text-[18px] leading-[27px] font-normal placeholder-slate-400 shadow-inner shadow-black/5 outline-hidden backdrop-blur-md transition-all duration-200 focus:shadow-lg focus:ring-2 focus:ring-blue-400/50 focus:outline-none dark:from-slate-700/60 dark:to-slate-700/40 dark:placeholder-slate-500"
          placeholder={placeholder}
          ref={inputRef}
          onChange={handleOnChange}
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.7), rgba(240,245,255,0.5))",
          }}
        />
        <span className="shrink-0 rounded-full bg-gradient-to-br from-white/70 to-white/50 px-3 py-1 font-sans text-[16px] leading-[21px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm dark:text-slate-400">
          {elements.current.length}
        </span>
      </div>
      <AIIdeas tabs={elements.current} />
      <CommandResults
        elements={elements}
        setSelectedElement={setSelectedElement}
        selectedElement={selectedElement}
        goTo={goTo}
        scroll={scroll}
      />
    </div>
  );
}

export default Command;
