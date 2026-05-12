<p align="center">
  <img src="https://signals.ensolabs.ai/logo.svg" alt="signal2noise" width="200" />
</p>

<h3 align="center">signal2noise</h3>

<p align="center">
  AI-powered signal intelligence engine and media distribution platform.<br/>
  <strong>Autonomous research → Curation → Publishing.</strong>
</p>

<p align="center">
  <a href="https://signals.ensolabs.ai"><img src="https://img.shields.io/badge/Live-signals.ensolabs.ai-5ce0d2?style=flat-square" alt="Live Site" /></a>
  <img src="https://img.shields.io/badge/Firebase-Hosted-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Claude-Powered-cc785c?style=flat-square&logo=anthropic&logoColor=white" alt="Claude" />
  <img src="https://img.shields.io/badge/Perplexity-Research-1a1a2e?style=flat-square" alt="Perplexity" />
</p>

---

## Overview

**signal2noise** is a fully autonomous intelligence platform that researches, curates, and publishes daily signals for AI and marketing strategists. Built by [Enso Labs](https://ensolabs.ai), it powers the content intelligence layer behind the studio's consulting practice.

The platform runs an end-to-end pipeline: AI agents scan hundreds of sources daily, extract actionable signals, generate analyst-grade summaries, and publish them to a live feed — with zero manual intervention.

## Architecture

```
signal2noise/
├── app/                        # React application
├── backend-integration/        # API connectors + data pipelines
├── components/                 # UI components (signal cards, feeds, filters)
├── contexts/                   # React context providers
├── functions/                  # Firebase Cloud Functions
├── hooks/                      # Custom React hooks
├── mcp-channel-evaluator/      # MCP-based channel scoring engine
├── n8n/                        # Workflow automation configs
├── scripts/                    # Automation + deployment scripts
├── skills/                     # Claude skill definitions
├── src/                        # Core application source
├── src-terminal/               # Terminal interface
├── utils/                      # Shared utilities
└── ux/                         # UX research + design artifacts
```

## How It Works

| Stage | What Happens |
|-------|-------------|
| **Research** | AI agents scan 200+ sources across AI, marketing, and enterprise tech using Perplexity and custom scrapers |
| **Extraction** | Claude analyzes raw content, extracts key signals, and scores relevance (1-10) |
| **Curation** | Signals are deduplicated, categorized, and ranked by strategic impact |
| **Publishing** | Top signals auto-publish to signals.ensolabs.ai with formatted cards |
| **Distribution** | Content flows to ensolabs.ai/insights, LinkedIn (3x/week), and newsletter |

## Key Features

| Feature | Details |
|---------|---------|
| **Daily signal generation** | Autonomous pipeline produces 10-15 curated signals per day |
| **MCP channel evaluator** | Scores and ranks distribution channels by reach and engagement |
| **Multi-format output** | Signal cards, long-form articles, social posts, newsletter digests |
| **Claude integration** | Deep integration with Claude for analysis, summarization, and content generation |
| **Perplexity research** | Automated research queries across web sources |
| **n8n workflows** | Orchestrated automation pipelines for scheduling and distribution |
| **Analytics** | GA4 tracking (G-CJ18GXXPMX) with custom event monitoring |
| **Real-time feed** | Live-updating signal feed embedded on ensolabs.ai |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Custom CSS |
| Backend | Firebase (Hosting, Cloud Functions, Firestore) |
| AI Research | Perplexity API, Claude API (Anthropic) |
| Automation | n8n workflows, custom scripts |
| Content | MCP skill definitions, channel evaluator |
| Analytics | GA4 (G-CJ18GXXPMX) |
| Deployment | Firebase Hosting (manual deploy) |

## Deploy

```bash
firebase deploy --only hosting
# Manual deploy — not auto-deployed from GitHub push
```

## Powered By

| Tool | Role |
|------|------|
| Claude (Anthropic) | Signal analysis, content generation, curation logic |
| Perplexity | Automated web research and source discovery |
| Firebase | Hosting, serverless functions, real-time database |
| n8n | Workflow orchestration and scheduling |
| Enso Labs | Strategy, architecture, human-in-the-loop oversight |

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Research by Perplexity · Intelligence by Claude · Platform by Enso Labs</strong><br/>
  <sub>Human-in-the-loop: <a href="https://linkedin.com/in/savbanerjee">Sav Banerjee</a></sub>
</p>
