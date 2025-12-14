import {
  TCategorizationRequest,
  TCategorizationResponse,
} from "~/type/categorization.ts";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async categorizeTabs(
    request: TCategorizationRequest,
  ): Promise<TCategorizationResponse> {
    const systemPrompt = `You are a browser tab categorization assistant. Categorize each tab into one of these categories based on its title and URL:
- research: Educational content, documentation, articles, Wikipedia, learning resources
- development: Code repositories, developer tools, IDEs, technical documentation
- entertainment: Videos, music, games, streaming services
- shopping: E-commerce sites, product pages, online stores
- social: Social media platforms, messaging apps
- productivity: Task managers, calendars, note-taking apps, office tools
- news: News websites, current events
- communication: Email, chat applications, video conferencing
- other: Anything that doesn't fit the above categories

Return ONLY a valid JSON object with this exact structure:
{
  "categories": [
    {"idx": 0, "category": "research"},
    {"idx": 1, "category": "development"}
  ]
}`;

    const userPrompt = `Categorize these tabs:\n${JSON.stringify(request.items, null, 2)}`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return JSON.parse(content) as TCategorizationResponse;
  }

  static isValidApiKey(key: string): boolean {
    return key.startsWith("sk-") && key.length > 20;
  }
}
