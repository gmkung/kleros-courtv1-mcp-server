#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { getDisputeData } from "./api.js";
import { GetDisputeSchema } from "./validation.js";

// Create the MCP server
const server = new Server(
  {
    name: "kleros-court-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_dispute_data",
        description:
          "Retrieve comprehensive dispute data from Kleros including meta-evidence and evidence submissions",
        inputSchema: {
          type: "object",
          properties: {
            disputeId: {
              type: "string",
              description:
                "The dispute ID to retrieve data for (will be converted to string)",
            },
            chainId: {
              type: "number",
              description: "The chain ID (1 for Ethereum, 100 for Gnosis)",
              enum: [1, 100],
            },
          },
          required: ["disputeId", "chainId"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_dispute_data") {
    try {
      const validatedArgs = GetDisputeSchema.parse(args);
      const disputeData = await getDisputeData(
        validatedArgs.disputeId,
        validatedArgs.chainId
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(disputeData),
          },
        ],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          content: [
            {
              type: "text",
              text: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error fetching dispute data: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kleros Court MCP Server running on stdio");
  
  // Optional: Simple health check endpoint for Railway
  if (process.env.PORT) {
    const http = await import('http');
    const healthServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'healthy', 
          service: 'kleros-court-mcp',
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(404);
        res.end('MCP Server - Use stdio for communication');
      }
    });
    
    const port = parseInt(process.env.PORT) || 8080;
    healthServer.listen(port, () => {
      console.error(`Health check endpoint running on port ${port}`);
    });
  }
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});
