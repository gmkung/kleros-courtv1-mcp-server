# 🤖 Using Your Kleros MCP Server with AI Assistants

## Claude Desktop (✅ Native MCP Support)

**Claude Desktop** has built-in MCP support - this is the primary way to use your server.

### Setup Instructions

1. **Install Claude Desktop**
   - Download from [claude.ai/desktop](https://claude.ai/desktop)

2. **Configure MCP Server**
   
   **Option A: Local Development**
   ```json
   {
     "mcpServers": {
       "kleros-court": {
         "command": "node",
         "args": ["dist/index.js"],
         "cwd": "/path/to/your/kleros-court-mcp"
       }
     }
   }
   ```

   **Option B: Railway Deployed (Coming Soon)**
   ```json
   {
     "mcpServers": {
       "kleros-court": {
         "command": "npx",
         "args": ["@kleros/court-mcp"],
         "env": {
           "MCP_SERVER_URL": "https://your-app.up.railway.app"
         }
       }
     }
   }
   ```

3. **Configuration File Location**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

4. **Restart Claude Desktop**

### Usage Example

Once configured, you can ask Claude:

```
"Get me information about Kleros dispute 463 on Gnosis chain"
```

Claude will automatically:
- Call your MCP server's `get_dispute_data` tool
- Retrieve meta-evidence and evidence data
- Present the information in a formatted way

## ChatGPT (❌ No Native MCP Support)

**ChatGPT does not support MCP protocol** - it's an OpenAI product, while MCP is from Anthropic.

### Alternatives for ChatGPT

#### Option 1: HTTP API Wrapper (Recommended)

Create a simple HTTP endpoint that ChatGPT can call:

```typescript
// api/chatgpt-webhook.ts
export default async function handler(req: any, res: any) {
  const { disputeId, chainId } = req.body;
  
  try {
    const disputeData = await getDisputeData(disputeId, chainId);
    return res.json(disputeData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
```

Then use ChatGPT Code Interpreter to call your API:

```python
import requests

def get_kleros_dispute(dispute_id, chain_id):
    response = requests.get(f"https://your-api.com/dispute/{dispute_id}?chainId={chain_id}")
    return response.json()

# Usage
dispute_data = get_kleros_dispute("463", 100)
print(dispute_data)
```

#### Option 2: Custom GPT with Actions

1. Create a Custom GPT in ChatGPT
2. Add an "Action" that calls your HTTP API
3. Configure the OpenAPI schema

#### Option 3: Manual Copy-Paste

Run your MCP server locally and copy the JSON output to ChatGPT.

## Other AI Assistants

### Anthropic Claude (Web) ❌
- The web version of Claude does **not** support MCP
- Only Claude Desktop has MCP integration

### Microsoft Copilot ❌
- No MCP support
- Would need HTTP API approach

### Google Bard/Gemini ❌
- No MCP support
- Would need HTTP API approach

## MCP vs Regular APIs

### MCP Protocol Benefits (Claude Desktop)
- **Automatic tool discovery**: Claude knows what tools are available
- **Type-safe parameters**: Automatic validation and error handling
- **Real-time communication**: Direct stdio connection
- **Context awareness**: Claude understands tool capabilities

### HTTP API Benefits (Other AIs)
- **Universal compatibility**: Works with any AI that can make HTTP requests
- **Web accessible**: Can be called from browsers, mobile apps, etc.
- **Caching**: Can implement response caching
- **Rate limiting**: Easy to add API rate limits

## Recommended Approach

1. **Primary**: Use with Claude Desktop via MCP (best experience)
2. **Secondary**: Create HTTP wrapper for other AI assistants
3. **Development**: Test locally with both approaches

## Example Claude Desktop Conversation

```
User: "What's the meta-evidence for Kleros dispute 463 on Gnosis chain?"

Claude: I'll get that dispute information for you.

[Claude automatically calls get_dispute_data tool]

Claude: "Here's the information about Kleros dispute 463 on Gnosis chain:

**Title**: Add a market to Seer Markets

**Description**: Someone requested to add a market to Seer Markets

**Ruling Options**: 
- Yes, Add It: Select this if you think the market complies with the required criteria and should be added.
- No, Don't Add It: Select this if you think the market does not comply with the required criteria and should not be added.

**Policy Document**: [View Policy](https://cdn.kleros.link/ipfs/...)

**Evidence Submitted**: 1 piece of evidence titled "Challenge Justification" describing a potential bug in the frontend..."
```

The MCP integration makes Claude Desktop much more powerful for Kleros dispute analysis! 🚀 