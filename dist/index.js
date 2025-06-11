#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';
// Chain configuration
const CHAIN_CONFIG = {
    1: {
        name: 'Ethereum',
        subgraphUrl: 'https://gateway.thegraph.com/api/d1d19cef4bc7647cc6cfad4ad2662628/subgraphs/id/BqbBhB4R5pNAtdYya2kcojMrQMp8nVHioUnP22qN8JoN'
    },
    100: {
        name: 'Gnosis',
        subgraphUrl: 'https://gateway.thegraph.com/api/d1d19cef4bc7647cc6cfad4ad2662628/subgraphs/id/FxhLntVBELrZ4t1c2HNNvLWEYfBjpB8iKZiEymuFSPSr'
    }
};
const KLEROS_CDN_BASE = 'https://cdn.kleros.link';
const KLEROS_API_BASE = 'https://kleros-api.netlify.app/.netlify/functions';
// Validation schemas
const GetDisputeSchema = z.object({
    disputeId: z.union([z.string(), z.number()]).transform(String),
    chainId: z.number().refine(id => id === 1 || id === 100, {
        message: 'Chain ID must be 1 (Ethereum) or 100 (Gnosis)'
    })
});
async function fetchMetaEvidence(chainId, disputeId) {
    const response = await axios.get(`${KLEROS_API_BASE}/get-dispute-metaevidence`, {
        params: { chainId, disputeId }
    });
    if (!response.data.metaEvidenceUri) {
        throw new Error('No meta evidence URI found');
    }
    const metaEvidenceUrl = `${KLEROS_CDN_BASE}${response.data.metaEvidenceUri}`;
    const metaEvidenceResponse = await axios.get(metaEvidenceUrl);
    const fileUrl = metaEvidenceResponse.data.fileURI ? `${KLEROS_CDN_BASE}${metaEvidenceResponse.data.fileURI}` : '';
    return {
        metaEvidence: metaEvidenceResponse.data,
        fileUrl
    };
}
async function fetchEvidences(chainId, disputeId) {
    const chainConfig = CHAIN_CONFIG[chainId];
    const query = {
        query: `
      query getDispute($id: String!) {
        dispute(id: $id) {
          evidenceGroup {
            evidence {
              URI
              sender
              creationTime
            }
          }
        }
      }
    `,
        variables: { id: disputeId }
    };
    const response = await axios.post(chainConfig.subgraphUrl, query, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data.data.dispute?.evidenceGroup?.evidence || [];
}
async function fetchEvidenceContent(evidenceUri) {
    const url = `${KLEROS_CDN_BASE}${evidenceUri}`;
    const response = await axios.get(url);
    return response.data;
}
async function getDisputeData(disputeId, chainId) {
    // Fetch meta evidence and evidences in parallel
    const [metaEvidenceData, evidences] = await Promise.all([
        fetchMetaEvidence(chainId, disputeId),
        fetchEvidences(chainId, disputeId)
    ]);
    // Fetch all evidence contents in parallel
    const evidenceContents = await Promise.all(evidences.map(evidence => fetchEvidenceContent(evidence.URI)));
    // Generate evidence file URLs
    const evidenceFileUrls = evidenceContents.map(content => content.fileURI ? `${KLEROS_CDN_BASE}${content.fileURI}` : '').filter(Boolean);
    return {
        disputeId,
        chainId,
        metaEvidence: metaEvidenceData.metaEvidence,
        metaEvidenceFileUrl: metaEvidenceData.fileUrl,
        evidences,
        evidenceContents,
        evidenceFileUrls
    };
}
// Create the MCP server
const server = new Server({
    name: 'kleros-court-mcp',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_dispute_data',
                description: 'Retrieve comprehensive dispute data from Kleros including meta-evidence and evidence submissions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        disputeId: {
                            type: 'string',
                            description: 'The dispute ID to retrieve data for (will be converted to string)'
                        },
                        chainId: {
                            type: 'number',
                            description: 'The chain ID (1 for Ethereum, 100 for Gnosis)',
                            enum: [1, 100]
                        }
                    },
                    required: ['disputeId', 'chainId']
                }
            }
        ]
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'get_dispute_data') {
        try {
            const validatedArgs = GetDisputeSchema.parse(args);
            const disputeData = await getDisputeData(validatedArgs.disputeId, validatedArgs.chainId);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(disputeData, null, 2)
                    }
                ]
            };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Validation error: ${error.errors.map(e => e.message).join(', ')}`
                        }
                    ],
                    isError: true
                };
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error fetching dispute data: ${errorMessage}`
                    }
                ],
                isError: true
            };
        }
    }
    throw new Error(`Unknown tool: ${name}`);
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Kleros Court MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map