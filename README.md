# Kleros Court MCP Server

A Model Context Protocol (MCP) server for retrieving comprehensive dispute data from Kleros Court, including meta-evidence and evidence submissions.

## Features

- Fetches dispute meta-evidence from Kleros API
- Retrieves evidence submissions via subgraph queries  
- Supports both Ethereum mainnet (chainId: 1) and Gnosis chain (chainId: 100)
- Parallel data fetching for optimal performance
- Returns formatted URLs for evidence files and meta-evidence documents

## Installation

```bash
yarn install
```

## Building

```bash
yarn build
```

## Running

### Development Mode
```bash
yarn dev
```

### Production Mode
```bash
yarn build
yarn start
```

## Usage

The server exposes one tool:

### `get_dispute_data`

Retrieves comprehensive dispute data including meta-evidence and all evidence submissions.

**Parameters:**
- `disputeId` (string|number): The dispute ID to retrieve data for
- `chainId` (number): The chain ID (1 for Ethereum, 100 for Gnosis)

**Example Responses:**

**Success Case (All evidence retrieved successfully):**
```json
{
  "disputeId": "463",
  "chainId": 100,
  "metaEvidence": {
    "title": "Add a market to Seer Markets",
    "description": "Someone requested to add a market to Seer Markets",
    "rulingOptions": {
      "titles": ["Yes, Add It", "No, Don't Add It"],
      "descriptions": [
        "Select this if you think the market complies with the required criteria and should be added.",
        "Select this if you think the market does not comply with the required criteria and should not be added."
      ]
    },
    "category": "Curated Lists",
    "question": "Does the market comply with the required criteria?",
    "disputePolicyFileUrl": "https://cdn.kleros.link/ipfs/QmWw7bJiCEQBcN7ufZZwxSR7wzKvVC3oyPWoE5nj4BfD4W/seer-verified-markets-on-gnosis-policy.pdf",
    "evidenceDisplayInterfaceURI": "https://cdn.kleros.link/ipfs/QmNhJXtMrxeJu4fpchPruGrL93bm2M4VmDZ8pj4x6FqnHJ/index.html",
    "metadata": {
      "tcrTitle": "Seer Markets",
      "tcrDescription": "Registry of verified Seer markets",
      "logoURI": "https://cdn.kleros.link/ipfs/QmckmpMuWGiGHCzbYgPqLPcCvLDj4YDPRZB63p7VaAjrbB/seer-logo-2-.png",
      "itemName": "market",
      "itemNamePlural": "markets"
    }
  },
  "evidenceContents": [
    {
      "title": "Challenge Justification",
      "description": "Dangerous bug. The Images type shows as \"Forbidden file type\" on the curated frontend. Then it shows the images, but at this point, I don't know what to trust. This is extremely dangerous and we must reject the item, the users must be protected.",
      "fileURI": "https://cdn.kleros.link/ipfs/QmZY9nCSxeT2NBkbmLVo2UWp4CtN2sDYr14HeeuK6iZ13h",
      "fileTypeExtension": "51",
      "type": "image/png"
    }
  ]
}
```

**Error Case (Some evidence failed to retrieve):**
```json
{
  "disputeId": "463",
  "chainId": 100,
  "metaEvidence": {
    "title": "Add a market to Seer Markets",
    "description": "Someone requested to add a market to Seer Markets",
    "disputePolicyFileUrl": "https://cdn.kleros.link/ipfs/QmWw7bJiCEQBcN7ufZZwxSR7wzKvVC3oyPWoE5nj4BfD4W/seer-verified-markets-on-gnosis-policy.pdf"
  },
  "evidenceErrors": [
    {
      "evidenceUri": "/ipfs/QmSomeFailedHash",
      "error": "Network timeout"
    },
    {
      "evidenceUri": "/ipfs/QmAnotherFailedHash",
      "error": "Invalid evidence content JSON received from /ipfs/QmAnotherFailedHash"
    }
  ]
}
```

## API Endpoints Used

1. **Meta-evidence API**: `https://kleros-api.netlify.app/.netlify/functions/get-dispute-metaevidence`
2. **Ethereum Subgraph**: `https://gateway.thegraph.com/api/.../BqbBhB4R5pNAtdYya2kcojMrQMp8nVHioUnP22qN8JoN`
3. **Gnosis Subgraph**: `https://gateway.thegraph.com/api/.../FxhLntVBELrZ4t1c2HNNvLWEYfBjpB8iKZiEymuFSPSr`
4. **IPFS Gateway**: `https://cdn.kleros.link`

## Error Handling

The server includes comprehensive error handling for:
- Invalid chain IDs (only 1 and 100 are supported)
- Network request failures
- Missing data responses
- Malformed dispute IDs

## Development

The server is built with:
- TypeScript for type safety
- Zod for input validation
- Axios for HTTP requests
- MCP SDK for protocol implementation

### Project Structure

```
src/
├── index.ts        # Main entry point and MCP server setup
├── api.ts          # Data fetching functions (meta-evidence, evidences)
├── config.ts       # Configuration constants and chain settings
├── types.ts        # TypeScript interfaces and type definitions
└── validation.ts   # Zod schemas for input validation
```

### Architecture

- **Modular Design**: Clean separation of concerns across files
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Error Handling**: Robust error handling with detailed error reporting
- **Flexible Structure**: Handles varying meta-evidence structures across dispute types

## 🚀 Deployment

**Recommended**: Deploy to Railway for free hosting of your MCP server.

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) for step-by-step deployment instructions.

**Quick start**: Push to GitHub → Connect to Railway → Auto-deploy! 🚂

## 🤖 AI Assistant Integration

See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for detailed instructions on using your deployed MCP server with:

- **✅ Claude Desktop** - Native MCP support (recommended)
- **❌ ChatGPT** - No MCP support (alternatives provided)
- **❌ Other AI assistants** - HTTP API approach needed

## License

MIT 