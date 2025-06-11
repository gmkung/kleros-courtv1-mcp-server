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

**Example Response:**
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
    "fileURI": "/ipfs/QmWw7bJiCEQBcN7ufZZwxSR7wzKvVC3oyPWoE5nj4BfD4W/seer-verified-markets-on-gnosis-policy.pdf"
  },
  "metaEvidenceFileUrl": "https://cdn.kleros.link/ipfs/QmWw7bJiCEQBcN7ufZZwxSR7wzKvVC3oyPWoE5nj4BfD4W/seer-verified-markets-on-gnosis-policy.pdf",
  "evidences": [
    {
      "URI": "/ipfs/Qmc4LnPxs5BLPWK6WQr7foArY7df83y49Y8k1LTAGeeCZP",
      "creationTime": "1749574530",
      "sender": "0x2ff064d951996c9fe70d6ba22d8684f37b2e24ec"
    }
  ],
  "evidenceContents": [
    {
      "title": "Challenge Justification",
      "description": "Dangerous bug. The Images type shows as \"Forbidden file type\" on the curated frontend...",
      "fileURI": "/ipfs/QmZY9nCSxeT2NBkbmLVo2UWp4CtN2sDYr14HeeuK6iZ13h",
      "fileTypeExtension": "51",
      "type": "image/png"
    }
  ],
  "evidenceFileUrls": [
    "https://cdn.kleros.link/ipfs/QmZY9nCSxeT2NBkbmLVo2UWp4CtN2sDYr14HeeuK6iZ13h"
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

## License

MIT 