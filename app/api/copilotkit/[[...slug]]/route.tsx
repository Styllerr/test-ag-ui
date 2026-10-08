import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
const builtInAgent = new BuiltInAgent({
  model: "openai:gpt-5.4-mini",
});
const runtime = new CopilotRuntime({
  agents: { default: builtInAgent }, //,
  intelligence: new CopilotKitIntelligence({
    apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  }),
  // Threads are per-user. Without this, every visitor shares one history.
  identifyUser: (request) => ({
    id: request.headers.get("x-user-id") ?? "anonymous",
    name: request.headers.get("x-user-name") ?? "Anonymous",
  }),
});
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});
export const GET = handler;
export const POST = handler;