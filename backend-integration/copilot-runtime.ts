import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { Request, Response } from "express";

// Import existing intelligence generation logic
async function fetchIntelligence(query: string, audience: string = "CMO") {
  // Call existing chat-intel endpoint logic
  const response = await fetch(`${process.env.BASE_URL || 'http://localhost:8080'}/chat-intel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, audience })
  });

  if (!response.ok) {
    throw new Error(`Intelligence fetch failed: ${response.statusText}`);
  }

  return response.json();
}

export async function copilotRuntimeHandler(req: Request, res: Response) {
  const runtime = new CopilotRuntime({
    actions: [
      {
        name: "get_market_intelligence",
        description: "Fetch strategic marketing intelligence with sources, metrics, and frameworks for C-suite marketing executives. Returns comprehensive briefings with data-driven insights, key signals, recommended actions, and strategic frameworks.",
        parameters: [
          {
            name: "query",
            type: "string",
            description: "Strategic marketing question or topic (e.g., 'AI marketing ROI trends', 'TikTok Shop commerce strategy')",
            required: true
          },
          {
            name: "audience",
            type: "string",
            enum: ["CMO", "VP Marketing", "Brand Director", "Growth Leader"],
            description: "Target executive audience for tailored intelligence depth and framing",
            required: false
          }
        ],
        handler: async ({ query, audience = "CMO" }) => {
          try {
            console.log(`[CopilotKit] Fetching intelligence for query: ${query}, audience: ${audience}`);
            const result = await fetchIntelligence(query, audience);

            return {
              success: true,
              summary: result.summary || result.message || "Intelligence retrieved successfully",
              signals: result.signals || result.keySignals || [],
              actions: result.movesForLeaders || result.actions || [],
              frameworks: result.frameworks || [],
              sources: result.sources || []
            };
          } catch (error) {
            console.error('[CopilotKit] Intelligence fetch error:', error);
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              summary: "Failed to fetch intelligence. Please try again.",
              signals: [],
              actions: [],
              frameworks: [],
              sources: []
            };
          }
        },
        render: ({ status, result }) => {
          if (status === "executing") return "🔍 Analyzing intelligence...";
          if (status === "streaming") return "📊 Generating insights...";
          if (status !== "complete") return "⏳ Processing...";

          return { type: "intelligence-brief", data: result };
        }
      }
    ]
  });

  try {
    const response = await runtime.response(req);
    return res.status(200).send(response);
  } catch (error) {
    console.error('[CopilotKit] Runtime error:', error);
    return res.status(500).json({
      error: 'CopilotKit runtime error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
