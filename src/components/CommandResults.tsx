import { TTab } from "../type/tab.tsx";
import { RefObject, useEffect, useRef } from "react";
import { TGoToOptions } from "~/components/Command.tsx";
import { cn } from "~/lib/utils.ts";
import { EScroll } from "~/type/misc.ts";

interface TTabResultsProps {
  elements: RefObject<TTab[]>;
  selectedElement: RefObject<number | null>;
  setSelectedElement: (idx: number) => void;
  goTo: (tab: TTab, options: TGoToOptions) => Promise<void>;
  scroll: EScroll;
}

const SEARCH_INPUT_SIZE: number = 55,
  AI_IDEAS_SIZE: number = 80,
  BORDER_SIZE: number = 2,
  PADDINGS_SEARCH_LIST: number = 16,
  SEARCH_ITEM_SIZE: number = 33,
  NAV_POPUP: number = 30,
  COLUMNS: number = 2;
const window_size = 600 - NAV_POPUP;
const menu_size =
  window_size -
  SEARCH_INPUT_SIZE -
  AI_IDEAS_SIZE -
  PADDINGS_SEARCH_LIST -
  BORDER_SIZE;
const rowsPerView = Math.floor(menu_size / SEARCH_ITEM_SIZE);
const capacity = rowsPerView * COLUMNS;

function CommandResults({
  elements,
  selectedElement,
  setSelectedElement,
  goTo,
  scroll,
}: TTabResultsProps) {
  const start = useRef(0);
  const end = useRef(capacity);

  const moveInGrid = (direction: "up" | "down" | "left" | "right") => {
    if (selectedElement.current == null) return;

    const total = elements.current.length;
    let newIdx = selectedElement.current;

    switch (direction) {
      case "up":
        newIdx = selectedElement.current - COLUMNS;
        if (newIdx < 0) newIdx = selectedElement.current; // Stay at top
        break;
      case "down":
        newIdx = selectedElement.current + COLUMNS;
        if (newIdx >= total) newIdx = selectedElement.current; // Stay at bottom
        break;
      case "left":
        if (selectedElement.current % COLUMNS !== 0) {
          newIdx = selectedElement.current - 1;
        }
        break;
      case "right":
        if (
          selectedElement.current % COLUMNS !== COLUMNS - 1 &&
          selectedElement.current + 1 < total
        ) {
          newIdx = selectedElement.current + 1;
        }
        break;
    }

    if (newIdx !== selectedElement.current) {
      setSelectedElement(newIdx);

      // Update pagination
      if (newIdx < start.current) {
        start.current = Math.floor(newIdx / COLUMNS) * COLUMNS;
        end.current = start.current + capacity;
      } else if (newIdx >= end.current) {
        end.current = Math.ceil((newIdx + 1) / COLUMNS) * COLUMNS;
        start.current = end.current - capacity;
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElement.current == null) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveInGrid("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          moveInGrid("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveInGrid("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          moveInGrid("right");
          break;
      }
    };

    const handleOnWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (selectedElement.current != null) {
        if (
          (scroll === EScroll.Default && e.deltaY < 0) ||
          (scroll === EScroll.Reversed && e.deltaY > 0)
        ) {
          moveInGrid("up");
        } else {
          moveInGrid("down");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleOnWheel, { passive: false });
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleOnWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnClick = async (idx: number, ctrlKey: boolean) => {
    if (selectedElement.current !== null && selectedElement.current === idx) {
      await goTo(elements.current[selectedElement.current], {
        newTab: ctrlKey,
      });
    } else {
      setSelectedElement(idx);
    }
  };

  return (
    <>
      {elements.current.length > 0 && (
        <div className="taby-searchList relative h-full overflow-scroll border-0 p-[12px] backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3">
            {elements.current
              .slice(start.current, end.current)
              .map((element) => (
                <div
                  key={element.idx}
                  className={cn(
                    "group relative flex cursor-pointer items-center gap-[12px] overflow-hidden rounded-2xl p-[10px] transition-all duration-300 select-none",
                    "bg-gradient-to-br from-white/80 via-white/60 to-white/40 dark:from-slate-700/60 dark:via-slate-800/50 dark:to-slate-700/40",
                    "border border-white/40 dark:border-white/10",
                    "shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10",
                    "backdrop-blur-md",
                    selectedElement.current !== null &&
                      element.idx === selectedElement.current
                      ? "scale-[1.02] bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-pink-50/70 ring-2 shadow-blue-200/30 ring-blue-400/60 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-pink-900/20 dark:shadow-blue-500/20"
                      : "hover:scale-[1.01] hover:border-white/60",
                  )}
                  onClick={(e) => handleOnClick(element.idx, e.ctrlKey)}
                  style={{
                    background:
                      selectedElement.current === element.idx
                        ? "linear-gradient(135deg, rgba(219, 234, 254, 0.9) 0%, rgba(233, 213, 255, 0.8) 50%, rgba(252, 231, 243, 0.7) 100%)"
                        : "linear-gradient(145deg, rgba(255,255,255,0.8), rgba(245,250,255,0.6))",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50"></div>
                  <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
                  {element.favIconUrl != null && element.favIconUrl !== "" ? (
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-md bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-sm"></div>
                      <img
                        src={element.favIconUrl}
                        className="relative m-0 flex h-[18px] w-[18px] shrink-0 items-center drop-shadow-sm"
                        alt=""
                      />
                    </div>
                  ) : (
                    <div className="h-[18px] w-[18px] shrink-0 rounded-md bg-gradient-to-br from-slate-200/50 to-slate-300/50"></div>
                  )}
                  <span
                    className={cn(
                      "relative z-10 truncate font-sans text-[13px] leading-[18px] transition-all duration-200",
                      element.idx === selectedElement.current
                        ? "font-semibold text-slate-800 drop-shadow-sm dark:text-white"
                        : "font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white",
                    )}
                  >
                    {element.title}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

export default CommandResults;
