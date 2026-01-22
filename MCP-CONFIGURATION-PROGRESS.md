# MCP Server Configuration Progress

**Date:** January 21, 2026
**Status:** In Progress - API Keys Needed

---

## ✅ Completed Steps

### 1. Located Claude Code Configuration
- **Location:** `~/.claude/`
- **Settings file:** `~/.claude/settings.local.json`
- **MCP config:** `~/.claude/mcp_settings.json` (created)

### 2. Created MCP Configuration File
Created `~/.claude/mcp_settings.json` with 4 MCP servers:
- ✅ n8n-mcp (czlonkowski)
- ✅ GitHub MCP (official)
- ✅ Slack MCP (official)
- ✅ Fetch MCP (official)

All servers use `npx` for zero-install deployment - they'll auto-download on first use.

---

## 🔑 API Keys & Tokens Needed

To complete the configuration, you need to obtain and add the following credentials:

### 1. n8n API Credentials

**What you need:**
- n8n instance URL
- n8n API key

**How to get them:**

**Option A: If you have n8n Cloud:**
1. Log into your n8n Cloud account
2. Go to Settings → API
3. Create a new API key
4. Copy the API key
5. Your instance URL is: `https://[your-workspace].app.n8n.cloud`

**Option B: If you have self-hosted n8n:**
1. Access your n8n instance
2. Go to Settings → n8n API
3. Generate API key
4. Your instance URL is your self-hosted domain

**Where to add:**
Edit `~/.claude/mcp_settings.json`:
```json
"n8n": {
  "env": {
    "N8N_API_URL": "https://your-actual-n8n-instance.com",
    "N8N_API_KEY": "your-actual-api-key"
  }
}
```

---

### 2. GitHub Personal Access Token

**What you need:**
- GitHub Personal Access Token with repo access

**How to get it:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Claude Code MCP Server"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:org` (Read org and team membership)
5. Click "Generate token"
6. **IMPORTANT:** Copy the token immediately (you won't see it again)

**Where to add:**
Edit `~/.claude/mcp_settings.json`:
```json
"github": {
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your-actual-token-here"
  }
}
```

---

### 3. Slack Bot Token

**What you need:**
- Slack Bot Token (`xoxb-...`)
- Slack Team ID

**How to get them:**

**Step 1: Create Slack App**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it: "PlannerAPI Publishing Bot"
4. Select your workspace

**Step 2: Add Bot Token Scopes**
1. Go to "OAuth & Permissions" in left sidebar
2. Scroll to "Scopes" → "Bot Token Scopes"
3. Add these scopes:
   - `chat:write` (Send messages)
   - `channels:read` (View basic channel info)
   - `channels:history` (View messages in public channels)
   - `im:write` (Start direct messages)

**Step 3: Install App to Workspace**
1. Scroll to top of "OAuth & Permissions"
2. Click "Install to Workspace"
3. Click "Allow"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

**Step 4: Get Team ID**
1. In Slack, click your workspace name → "Settings & administration" → "Workspace settings"
2. Look at URL: `https://app.slack.com/client/T12345ABC/...`
3. The Team ID is the part after `/client/` (e.g., `T12345ABC`)

**Step 5: Add Bot to Channels**
1. Go to the channels you want to post to (e.g., `#content-alerts`, `#publishing-approval`)
2. Type `/invite @PlannerAPI Publishing Bot`

**Where to add:**
Edit `~/.claude/mcp_settings.json`:
```json
"slack": {
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-actual-token",
    "SLACK_TEAM_ID": "T12345ABC"
  }
}
```

---

### 4. Fetch MCP Server

**What you need:**
- Nothing! This server requires no credentials.

**What it does:**
- Fetches web pages
- Checks if URLs are accessible
- Verifies source links

This one is ready to use as-is.

---

## 🧪 Testing the Configuration

After adding all credentials, restart Claude Code and test each MCP server:

### Test 1: Check MCP Servers are Loaded
```bash
# List available MCP tools (this should show tools from all 4 servers)
# You can do this by asking Claude to list available MCP tools
```

### Test 2: Test Fetch Server (No credentials needed)
Ask Claude:
> "Use the fetch MCP server to check if https://www.anthropic.com is accessible"

### Test 3: Test GitHub Server
Ask Claude:
> "Use the GitHub MCP server to read the README.md file from my PlannerAPI repository"

### Test 4: Test n8n Server
Ask Claude:
> "Use the n8n MCP server to list all my n8n workflows"

### Test 5: Test Slack Server
Ask Claude:
> "Use the Slack MCP server to send a test message to #general: 'MCP server is working!'"

---

## 🚨 Security Notes

### Storage Location
The file `~/.claude/mcp_settings.json` contains sensitive credentials. It's stored locally on your machine and is NOT synced to any cloud service.

### Permissions
- File permissions are set to user-only access
- Never commit this file to Git
- Never share this file publicly

### Rotating Tokens
If any token is compromised:
1. Revoke it immediately in the respective service (GitHub/Slack/n8n)
2. Generate a new token
3. Update the `mcp_settings.json` file
4. Restart Claude Code

---

## 📋 Next Steps

Once all API keys are added:

1. ✅ Restart Claude Code (to load MCP servers)
2. ✅ Test each MCP server connection
3. ✅ Install n8n-skills: `/plugin install czlonkowski/n8n-skills`
4. ✅ Build custom channel-evaluator MCP server
5. ✅ Create autonomous-publisher skill
6. ✅ Run end-to-end test

---

## 🔧 Troubleshooting

### MCP Server Won't Load
**Error:** "Failed to start MCP server"

**Fix:**
1. Check that the API key is correct (no extra spaces)
2. Ensure the token has the right permissions
3. Restart Claude Code
4. Check Claude logs: `~/.claude/debug/`

### GitHub Token Invalid
**Error:** "Bad credentials" or "401 Unauthorized"

**Fix:**
1. Regenerate token at https://github.com/settings/tokens
2. Ensure you selected the `repo` scope
3. Copy the new token to `mcp_settings.json`

### Slack Bot Can't Post
**Error:** "not_in_channel"

**Fix:**
1. Go to Slack channel
2. Type: `/invite @PlannerAPI Publishing Bot`
3. Try posting again

### n8n Connection Failed
**Error:** "Connection refused"

**Fix:**
1. Verify your n8n instance URL is correct
2. Check if n8n API is enabled (Settings → n8n API)
3. Regenerate API key if needed

---

## 📝 Current Configuration File

**Location:** `~/.claude/mcp_settings.json`

**Structure:**
```json
{
  "mcpServers": {
    "n8n": { ... },
    "github": { ... },
    "slack": { ... },
    "fetch": { ... }
  }
}
```

Each server runs via `npx` with zero installation - packages download automatically on first use.

---

## ✅ Ready to Proceed

Once you've added all the API keys and tested the connections, we'll move on to:

1. Installing the n8n-skills package
2. Building the custom channel-evaluator MCP server
3. Creating the autonomous-publisher skill
4. Running the full publishing workflow

**Progress:** 40% complete (infrastructure configured, credentials needed)

