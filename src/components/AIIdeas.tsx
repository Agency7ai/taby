import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { EStorage } from "~/type/misc.ts";
import { TTab } from "~/type/tab.tsx";

interface AIIdeasProps {
  tabs: TTab[];
}

function AIIdeas({ tabs }: AIIdeasProps) {
  const [idea, setIdea] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only analyze when we have tabs and categorization is enabled
    if (tabs.length === 0) return;

    const analyzeTabs = async () => {
      try {
        const settings = await browser.storage.local.get([
          EStorage.EnableCategorization,
          EStorage.OpenAIKey,
        ]);

        if (
          !settings[EStorage.EnableCategorization] ||
          !settings[EStorage.OpenAIKey]
        ) {
          return;
        }

        setLoading(true);

        // Call OpenAI to analyze tabs
        const apiKey = settings[EStorage.OpenAIKey] as string;
        const tabTitles = tabs
          .slice(0, 20)
          .map((t) => `• ${t.title}`)
          .join("\n");

        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that analyzes browser tabs and suggests helpful ideas. Be brief and actionable. Suggest ONE thing the user might want to do based on their open tabs. Start with 'Have you thought of' and keep it under 60 characters.",
                },
                {
                  role: "user",
                  content: `Based on these open tabs, suggest something helpful:\n\n${tabTitles}`,
                },
              ],
              temperature: 0.7,
              max_tokens: 50,
            }),
          },
        );

        const data = await response.json();
        const suggestion = data.choices[0]?.message?.content || "";
        setIdea(suggestion);
      } catch (error) {
        console.error("AI Ideas error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to avoid too many API calls
    const timer = setTimeout(analyzeTabs, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]); // Only re-run when tab count changes

  if (!idea && !loading) return null;

  return (
    <div className="group relative overflow-hidden border-b border-white/20 px-4 py-4">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/70 via-amber-50/60 to-orange-50/50 dark:from-yellow-900/20 dark:via-amber-900/15 dark:to-orange-900/10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-yellow-200/60 to-transparent"></div>
      <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

      <div className="relative flex items-center gap-3 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-300/30 blur-md"></div>
          <span className="relative text-2xl brightness-110 drop-shadow-lg filter">
            💡
          </span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-sm font-medium text-slate-600 text-transparent italic dark:from-slate-300 dark:to-slate-400 dark:text-slate-300">
              Analyzing tabs
            </span>
            <div className="flex gap-1">
              <div
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gradient-to-br from-pink-400 to-orange-400"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        ) : (
          <span className="text-sm leading-relaxed font-semibold text-slate-800 drop-shadow-sm dark:text-slate-100">
            {idea}
          </span>
        )}
      </div>
    </div>
  );
}

export default AIIdeas;
