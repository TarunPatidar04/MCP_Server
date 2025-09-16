import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { z } from "zod";

// create a MCP server
const server = new McpServer({
  name: "Currency Converter MCP Server",
  version: "1.0.0",
});

// tool
server.tool(
  "convertCurrency", //name
  "Convert amount from one currency to another", //description
  // schema
  {
    amount: z.number().describe("Amount to convert for e.g. 100"),
    from: z.string().describe("Base currency code, e.g. USD"),
    to: z.string().describe("Target currency code, e.g. INR"),
  },

  async ({ amount, from, to }) => {
    try {
      // 100$ --- EUR
      // 1$ --- EUR = x
      // amount =x

      const res = await fetch(
        `https://open.er-api.com/v6/latest/${from.toUpperCase()}`
      );
      const data = await res.json();

      const rate = data.rates(to.toUpperCase());
      const converted = (amount * rate).toFixed(2);

      const result = `${amount} ${from.toUpperCase()} = ${converted} ${to.toUpperCase()}`;
      console.log(result);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error : ${error.message}`,
          },
        ],
      };
    }
  }
);

// ADD a function


// Start the server with stdio transport
async function startServer(params) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP convert currency server started");
}

startServer().catch((error) => {
  console.error("Failed to start MCP server : ", error);
  process.exit(1);
});
