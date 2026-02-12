# MCP Configuration Security Checklist

**Date:** January 21, 2026

---

## ✅ YES - It's Safe to Add API Keys to mcp_settings.json

**Location:** `~/.claude/mcp_settings.json`

### Why This is Secure:

1. **✅ Local File Only**
   - Stored in `~/.claude/` (your home directory)
   - NOT in the PlannerAPI-clean git repository
   - NOT synced to GitHub or any cloud service
   - Only exists on your local machine

2. **✅ Proper File Permissions**
   - Set to `600` (owner read/write only)
   - No other users on your machine can read it
   - Protected from accidental exposure

3. **✅ Standard Practice**
   - This is the official location for MCP server credentials
   - Same pattern as `.env` files or `~/.aws/credentials`
   - Used by Claude Desktop and Claude Code

---

## 🔒 Security Best Practices

### DO:
- ✅ Add your API keys directly to `~/.claude/mcp_settings.json`
- ✅ Keep this file on your local machine only
- ✅ Verify file permissions are `600` (done automatically)
- ✅ Rotate tokens if you suspect compromise

### DON'T:
- ❌ Never commit this file to git
- ❌ Never copy API keys into files in the PlannerAPI-clean directory
- ❌ Never share this file via Slack/email/screenshot
- ❌ Never add to cloud sync folders (Dropbox, Google Drive, etc.)

---

## 📍 File Locations Summary

### Safe for API Keys (Local Only):
```
~/.claude/mcp_settings.json               ← API keys go here ✅
~/.claude/settings.local.json             ← Safe for local settings ✅
```

### NOT Safe for API Keys (Git Repository):
```
/Users/savbanerjee/Projects/PlannerAPI-clean/   ← Git repo ❌
    Any .json files here                         ← Will be committed ❌
    Any .md files here                           ← Will be committed ❌
```

**Rule:** If it's in the `PlannerAPI-clean` directory, assume it will be committed to git.

---

## 🔑 API Keys to Add

Edit `~/.claude/mcp_settings.json` and replace these placeholders:

```json
{
  "mcpServers": {
    "n8n": {
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",  ← Replace
        "N8N_API_KEY": "REPLACE_WITH_YOUR_N8N_API_KEY"   ← Replace
      }
    },
    "github": {
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "REPLACE_WITH_YOUR_GITHUB_TOKEN"  ← Replace
      }
    },
    "slack": {
      "env": {
        "SLACK_BOT_TOKEN": "REPLACE_WITH_YOUR_SLACK_BOT_TOKEN",  ← Replace
        "SLACK_TEAM_ID": "REPLACE_WITH_YOUR_SLACK_TEAM_ID"       ← Replace
      }
    }
  }
}
```

---

## 🧪 How to Edit Safely

### Option 1: Using a Text Editor (Recommended)
```bash
# Open in your preferred editor
nano ~/.claude/mcp_settings.json
# or
code ~/.claude/mcp_settings.json
# or
open -a "TextEdit" ~/.claude/mcp_settings.json
```

### Option 2: Using Claude Code (Most Secure)
You can ask me to read the file, and I'll show you the contents. Then you can tell me the keys to add and I'll edit the file directly (without the keys appearing in git history).

---

## 🚨 What to Do If a Key is Compromised

If you accidentally expose a key (screenshot, commit to git, etc.):

### 1. GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Delete" next to the exposed token
3. Generate a new token
4. Update `mcp_settings.json` with new token

### 2. Slack Bot Token
1. Go to https://api.slack.com/apps
2. Select your app
3. Go to "OAuth & Permissions"
4. Click "Revoke" on the bot token
5. Reinstall app to workspace
6. Copy new token to `mcp_settings.json`

### 3. n8n API Key
1. Log into n8n
2. Settings → API
3. Delete the exposed key
4. Generate new key
5. Update `mcp_settings.json`

---

## ✅ Security Verification Checklist

Before adding keys, verify:

- [ ] File is at `~/.claude/mcp_settings.json` (not in git repo)
- [ ] File permissions are `600` (owner only)
- [ ] You're editing the file locally (not copy/pasting into chat)
- [ ] Your editor is not set to auto-backup to cloud
- [ ] You understand these keys are powerful (full repo access, etc.)

---

## 📊 Current Status

**File Location:** `~/.claude/mcp_settings.json`
**File Permissions:** `-rw------- (600)` ✅ Secure
**In Git Repo:** No ✅ Safe
**Ready for API Keys:** Yes ✅

---

## 💡 Pro Tips

### Use a Password Manager
Consider storing a backup of these API keys in a password manager (1Password, LastPass, etc.) so you can:
- Easily rotate them if needed
- Remember what tokens you created
- Share specific tokens with team members securely

### Name Your Tokens
When creating tokens, use descriptive names:
- GitHub: "Claude Code MCP Server - Jan 2026"
- Slack: "PlannerAPI Publishing Bot"
- n8n: "Claude Code Integration"

This makes it easy to identify and revoke specific tokens later.

### Audit Regularly
Every few months, review:
- What tokens exist in `mcp_settings.json`
- Are they all still needed?
- Should any be rotated for security?

---

**You're safe to add your API keys to `~/.claude/mcp_settings.json` now!**

