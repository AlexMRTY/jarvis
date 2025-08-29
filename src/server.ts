import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { z } from "zod"
import express, { type Request, type Response } from "express"
const getServer = () => {
  const server = new McpServer({
    name: "jarvis-mcp",
    version: "1.0.0",
    capabilities: {
      tools: {}
    }
  })

  server.tool("change-directory", "Change the current directory to a given path.", {
    absolutePath: z.string(),
  }, {
    title: "Change Directory",
    readOnlyHint: true,
    distructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  }, async (params) => {
      // try {
      //
      // } catch {
      //
      // }
      return {
        content: [
          { type: "text", text: "This is a test" }
        ]
      }
  })

  return server
}

// async function main() {
//    const transport = new StdioServerTransport() 
//    await server.connect(transport)
// }

const app = express();
app.use(express.json());

app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const server = getServer()
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      console.log("Request closed");
      transport.close();
      server.close();
    });

    await server.connect(transport);

    await transport.handleRequest(req, res, req.body);

  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`MCP Stateless Streamable HTTP Server listening on port ${PORT}`);
});


// main()
