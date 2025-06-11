#!/usr/bin/env node

// Simple test script to verify the MCP server functionality
import { spawn } from 'child_process';

console.log('Testing Kleros Court MCP Server...');

const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Initialize the server
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

server.stdin.write(JSON.stringify(initMessage) + '\n');

// List tools
const listToolsMessage = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 1000);

// Test with example dispute
const testDisputeMessage = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'get_dispute_data',
    arguments: {
      disputeId: '463',
      chainId: 100
    }
  }
};

setTimeout(() => {
  server.stdin.write(JSON.stringify(testDisputeMessage) + '\n');
}, 2000);

let output = '';
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  output += response;
  
  // Try to parse and pretty print JSON responses
  const lines = response.split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const parsed = JSON.parse(line);
      
      // Check if this is an MCP response with dispute data
      if (parsed.result && parsed.result.content && parsed.result.content[0] && parsed.result.content[0].text) {
        try {
          // Parse the dispute data from the text field
          const disputeData = JSON.parse(parsed.result.content[0].text);
          console.log('\n=== 🏛️  KLEROS DISPUTE DATA ===');
          console.log(JSON.stringify(disputeData, null, 2));
          console.log('================================\n');
        } catch (innerError) {
          // If the text field isn't JSON, show the MCP response
          console.log('\n=== MCP Response ===');
          console.log(JSON.stringify(parsed, null, 2));
          console.log('===================\n');
        }
      } else {
        // Show other MCP responses (like tool list, etc.)
        console.log('\n=== MCP Response ===');
        console.log(JSON.stringify(parsed, null, 2));
        console.log('===================\n');
      }
    } catch (error) {
      // If it's not JSON, just log it as is
      console.log('Raw response:', line);
    }
  });
});

server.on('error', (error) => {
  console.error('Error:', error);
});

// Close after 10 seconds
setTimeout(() => {
  server.kill();
  console.log('Test completed');
}, 10000); 