# Agentic Publishing System Setup Guide

**Goal:** Build an autonomous multi-channel publishing system using existing MCP servers and Claude Code skills.

**Architecture:** Use community-standard tools instead of building from scratch.

---

## Step 1: Install Claude Code Skills

Install the n8n skillset for Claude Code:

```bash
# From Claude Code CLI
/plugin install czlonkowski/n8n-skills
```

This installs 7 skills that teach Claude how to build production-ready n8n workflows:
- n8n Expression Syntax
- n8n MCP Tools Expert
- n8n Workflow Patterns
- n8n Validation Expert
- n8n Node Configuration
- n8n Code JavaScript
- n8n Code Python

**Documentation:** https://github.com/czlonkowski/n8n-skills

---

## Step 2: Configure MCP Servers

Add these MCP servers to your Claude Code configuration:

### 2.1: n8n-mcp (Deep n8n Knowledge)

```bash
# Install globally
npm install -g @czlonkowski/n8n-mcp

# Or use npx (no installation needed)
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "@czlonkowski/n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-n8n-api-key"
      }
    }
  }
}
```

**What this provides:**
- Knowledge of 1,084 n8n nodes
- Real-world workflow examples
- Node configuration schemas

### 2.2: GitHub MCP (Version Control)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
      }
    }
  }
}
```

**What this provides:**
- Read editorial guidelines from repo
- Version control publishing reports
- Track workflow changes

### 2.3: Slack MCP (Notifications & Approvals)

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token",
        "SLACK_TEAM_ID": "your-team-id"
      }
    }
  }
}
```

**What this provides:**
- Send approval requests
- Alert team to publishing decisions
- Real-time notifications

### 2.4: Fetch MCP (Source Verification)

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

**What this provides:**
- Verify source URLs still work
- Scrape content for validation
- Check link health

### 2.5: Custom Channel Evaluator (ONLY custom piece)

This is the ONLY thing you need to build from scratch:

```json
{
  "mcpServers": {
    "channel-evaluator": {
      "command": "node",
      "args": ["/Users/savbanerjee/Projects/PlannerAPI-clean/mcp-channel-evaluator/build/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-anthropic-key"
      }
    }
  }
}
```

**What this provides:**
- Evaluate card fit for LinkedIn/Medium/Substack
- Score content-channel alignment
- Suggest formatting improvements

---

## Step 3: Build ONLY the Custom Channel Evaluator

Since everything else exists, you only need to build the channel evaluation logic.

### 3.1: Create MCP Server Structure

```bash
cd /Users/savbanerjee/Projects/PlannerAPI-clean
mkdir mcp-channel-evaluator
cd mcp-channel-evaluator
npm init -y
npm install @modelcontextprotocol/sdk @anthropic-ai/sdk
npm install --save-dev typescript @types/node
```

### 3.2: Create Simple MCP Server

Create `src/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const server = new Server(
  {
    name: 'channel-evaluator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the evaluation tool
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'evaluate_card_for_channel',
      description: 'Evaluates how well an intelligence card fits a specific publishing channel',
      inputSchema: {
        type: 'object',
        properties: {
          card: {
            type: 'object',
            description: 'The discover card to evaluate'
          },
          channel: {
            type: 'string',
            enum: ['linkedin', 'medium', 'substack'],
            description: 'Target publishing channel'
          }
        },
        required: ['card', 'channel']
      }
    }
  ]
}));

// Implement the evaluation logic
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'evaluate_card_for_channel') {
    const { card, channel } = request.params.arguments;

    const channelGuidelines = {
      linkedin: {
        ideal_length: '150-200 words',
        tone: 'Professional, data-driven, actionable',
        format: 'Hook + bullets + CTA',
        strengths: 'Data points, career relevance, quick insights',
        weaknesses: 'Long narratives, academic language, no clear takeaway'
      },
      medium: {
        ideal_length: '800-1200 words',
        tone: 'Analytical, thoughtful, educational',
        format: 'Narrative with subheadings and depth',
        strengths: 'Deep analysis, case studies, research-backed',
        weaknesses: 'Surface-level takes, bullet lists only, no depth'
      },
      substack: {
        ideal_length: '500-800 words',
        tone: 'Personal, opinionated, conversational',
        format: 'Newsletter style with strong POV',
        strengths: 'Hot takes, personal stories, contrarian views',
        weaknesses: 'Neutral reporting, corporate speak, no personality'
      }
    };

    const prompt = `You are a content strategist evaluating whether this intelligence card is a good fit for ${channel}.

CARD DATA:
Title: ${card.title}
Summary: ${card.summary}
Signals: ${card.signals?.join('\n- ') || 'N/A'}
Moves: ${card.moves?.join('\n- ') || 'N/A'}
Pillar: ${card.pillar}
Type: ${card.type}

CHANNEL GUIDELINES FOR ${channel.toUpperCase()}:
${JSON.stringify(channelGuidelines[channel], null, 2)}

EVALUATE:
1. Content-channel fit score (0-100)
2. Why this score? (specific strengths and weaknesses)
3. What needs to change to optimize for this channel?

Return ONLY valid JSON in this exact format:
{
  "score": 85,
  "reasoning": "This card has strong data points (signals) which work well for LinkedIn's professional audience. The actionable moves align with LinkedIn's career-focused users. However, the summary could be more concise.",
  "strengths": [
    "Clear data points in signals",
    "Actionable takeaways in moves",
    "Professional tone"
  ],
  "weaknesses": [
    "Summary slightly long for LinkedIn",
    "Could use more specific numbers in title"
  ],
  "recommendedEdits": [
    "Shorten summary to 150 words",
    "Lead with most surprising signal in title",
    "Add specific ROI data if available"
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const evaluation = JSON.parse(response.content[0].text);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(evaluation, null, 2)
      }]
    };
  }

  throw new Error('Unknown tool');
});

const transport = new StdioServerTransport();
server.connect(transport);
```

### 3.3: Build and Test

```bash
# Add build script to package.json
npm run build

# Test locally
echo '{"card": {"title": "Test", "summary": "Test summary"}, "channel": "linkedin"}' | node build/index.js
```

---

## Step 4: Create Publishing Skill

Create `/Users/savbanerjee/Projects/PlannerAPI-clean/skills/autonomous-publisher/main.ts`:

```typescript
/**
 * Autonomous Intelligence Publisher
 *
 * Uses existing MCP servers + minimal custom logic
 * to autonomously publish content across channels.
 */

export async function execute() {
  console.log('🤖 Starting autonomous publishing workflow...\n');

  // 1. Fetch unposted cards from Firebase
  const response = await fetch(
    'https://us-central1-plannerapi-prod.cloudfunctions.net/getTopCardForPublishing',
    {
      headers: {
        'X-API-Key': process.env.FIREBASE_API_KEY
      }
    }
  );

  const { card } = await response.json();
  console.log(`📊 Selected card: "${card.title}"\n`);

  // 2. Load editorial guidelines from GitHub (using GitHub MCP)
  console.log('📖 Loading editorial guidelines from GitHub...');
  const guidelines = await githubMCP.readFile({
    path: 'docs/EDITORIAL_VOICE.md'
  });

  // 3. Verify source link still works (using Fetch MCP)
  if (card.sourceUrl) {
    console.log(`🔍 Verifying source: ${card.sourceUrl}`);
    const sourceCheck = await fetchMCP.checkUrl(card.sourceUrl);
    if (!sourceCheck.accessible) {
      await slackMCP.sendMessage({
        channel: '#content-alerts',
        text: `⚠️ Dead link in card: "${card.title}"`
      });
      return;
    }
  }

  // 4. Evaluate for each channel (using Custom MCP)
  const channels = ['linkedin', 'medium', 'substack'];
  const publishingPlan = [];

  for (const channel of channels) {
    console.log(`\n🎯 Evaluating for ${channel}...`);

    const evaluation = await channelEvaluatorMCP.callTool(
      'evaluate_card_for_channel',
      { card, channel }
    );

    console.log(`   Score: ${evaluation.score}/100`);
    console.log(`   Reasoning: ${evaluation.reasoning}\n`);

    if (evaluation.score > 85) {
      publishingPlan.push({
        channel,
        score: evaluation.score,
        action: evaluation.score > 92 ? 'auto_publish' : 'request_approval'
      });
    }
  }

  // 5. Execute plan
  for (const plan of publishingPlan) {
    if (plan.action === 'auto_publish') {
      // Build workflow using n8n-skills knowledge
      await buildAndTriggerN8nWorkflow(card, plan.channel);
    } else {
      // Send Slack approval
      await slackMCP.sendMessage({
        channel: '#publishing-approval',
        text: `Approve publishing "${card.title}" to ${plan.channel}? (Score: ${plan.score})`
      });
    }
  }

  // 6. Log to GitHub for audit trail
  await githubMCP.createFile({
    path: `reports/publishing/${new Date().toISOString().split('T')[0]}.md`,
    content: generateReport(card, publishingPlan)
  });

  console.log('\n✅ Publishing workflow complete!');
}

async function buildAndTriggerN8nWorkflow(card, channel) {
  // Use n8n-mcp knowledge to build the right workflow
  // Use n8n-skills to ensure correct syntax
  // Trigger via n8n API or webhook
}

function generateReport(card, plan) {
  return `# Publishing Report - ${new Date().toISOString()}

## Card: ${card.title}

${plan.map(p => `- ${p.channel}: Score ${p.score} - ${p.action}`).join('\n')}
`;
}
```

---

## Step 5: Connect to n8n

### Option A: n8n Calls MCP Servers (Recommended)

Add **MCP Client Tool** node to your n8n workflows:

1. Open n8n workflow
2. Add "MCP Client Tool" node
3. Configure to call your channel-evaluator MCP
4. Use evaluation score to route to different channels

### Option B: Claude Triggers n8n Workflows

Keep current architecture where Claude makes decisions, then triggers n8n via webhooks.

---

## Success Criteria

After setup, you should be able to:

1. ✅ Run `/autonomous-publisher` skill in Claude Code
2. ✅ See it fetch card from Firebase
3. ✅ See it load guidelines from GitHub
4. ✅ See it evaluate card for 3 channels
5. ✅ See it trigger n8n workflows or send Slack approvals
6. ✅ See publishing report saved to GitHub

---

## The Credibility Story

**What you built:**
- Autonomous multi-channel publishing using:
  - 7 pre-built Claude Code skills (n8n expertise)
  - 4 official MCP servers (GitHub, Slack, Fetch, n8n)
  - 1 custom MCP server (channel evaluation - your unique logic)
  - n8n as execution layer
  - Firebase as data layer

**Why this matters:**
- You're using community-standard tools (not reinventing the wheel)
- You only built the unique business logic (channel evaluation)
- Everything is auditable (GitHub logs, Slack notifications)
- It's replicable (others can use same MCP servers)
- It demonstrates best practices (separation of concerns)

**The pitch:**
> "We built an agentic publishing system using MCP servers - the same protocol Claude Desktop uses. We leveraged 4 existing servers (GitHub, Slack, n8n, Fetch) and built only 1 custom server for our unique channel evaluation logic. This is how modern AI infrastructure should work: compose existing tools, build only what's unique to your business."

---

## Next Steps

1. Install n8n-skills: `/plugin install czlonkowski/n8n-skills`
2. Configure MCP servers in Claude Code config
3. Build minimal channel-evaluator MCP server
4. Test each MCP server independently
5. Create autonomous-publisher skill
6. Run end-to-end test
7. Document and publish case study

