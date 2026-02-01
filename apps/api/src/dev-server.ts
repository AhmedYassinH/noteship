import express from "express";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler as createNoteHandler } from "./handlers/notes/create";
import { handler as getNoteHandler } from "./handlers/notes/get";
import { handler as listNotesHandler } from "./handlers/notes/list";
import { handler as updateNoteHandler } from "./handlers/notes/update";
import { handler as deleteNoteHandler } from "./handlers/notes/delete";
import { handler as uploadNoteArtifactHandler } from "./handlers/notes/upload";
import { handler as getMeHandler } from "./handlers/users/me";
import { handler as createPostHandler } from "./handlers/posts/create";
import { handler as listPostsHandler } from "./handlers/posts/list";
import { handler as publishPostHandler } from "./handlers/posts/publish";
import { handler as schedulePostHandler } from "./handlers/posts/schedule";
import { handler as cancelPostHandler } from "./handlers/posts/cancel";
import { handler as searchHandler } from "./handlers/search/searchInNotes";
import { handler as createDraftHandler } from "./handlers/drafts/create";
import { handler as listIntegrationsHandler } from "./handlers/integrations/list";
import { handler as connectIntegrationHandler } from "./handlers/integrations/connect";
import { handler as integrationCallbackHandler } from "./handlers/integrations/callback";
import { handler as disconnectIntegrationHandler } from "./handlers/integrations/disconnect";
import { handler as billingCheckoutHandler } from "./handlers/billing/checkout";
import { handler as billingPortalHandler } from "./handlers/billing/portal";
import { handler as billingWebhookHandler } from "./handlers/billing/webhook";
import { handler as createContentSessionHandler } from "./handlers/content/session";

const app = express();
app.use(express.json());

// Mock API Gateway event wrapper
const toApiEvent = (req: express.Request): APIGatewayProxyEventV2 => {
  const authorization = req.headers.authorization || "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  // Extract JWT claims from Bearer token (if provided)
  let claims: Record<string, unknown> = {};
  if (bearer) {
    try {
      // Decode JWT payload (don't verify in dev mode)
      const payload = bearer.split(".")[1];
      if (payload) {
        claims = JSON.parse(Buffer.from(payload, "base64url").toString());
      }
    } catch {
      // If decoding fails, use fallback local user
      console.warn("Failed to decode JWT, using fallback local user");
    }
  }

  // Fallback to local test user if no JWT or decoding failed
  if (!claims.sub) {
    claims = {
      sub: "local-user-123",
      email: "dev@noteship.local",
      name: "Dev User",
    };
  }

  return {
    version: "2.0",
    routeKey: `${req.method} ${req.path}`,
    rawPath: req.path,
    rawQueryString: req.url.split("?")[1] || "",
    headers: req.headers as Record<string, string>,
    queryStringParameters: req.query as Record<string, string>,
    body: req.body ? JSON.stringify(req.body) : undefined,
    requestContext: {
      accountId: "000000000000",
      apiId: "local",
      authorizer: {
        jwt: {
          claims,
          scopes: null,
        },
      },
      domainName: "localhost",
      domainPrefix: "local",
      http: {
        method: req.method,
        path: req.path,
        protocol: "HTTP/1.1",
        sourceIp: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "dev-server",
      },
      requestId: `local-${Date.now()}`,
      routeKey: `${req.method} ${req.path}`,
      stage: "$default",
      time: new Date().toUTCString(),
      timeEpoch: Date.now(),
    },
    isBase64Encoded: false,
  } as APIGatewayProxyEventV2;
};

// Helper to execute handler and send response
const executeHandler = async (
  handler: (event: APIGatewayProxyEventV2) => Promise<any>,
  req: express.Request,
  res: express.Response,
) => {
  try {
    const event = toApiEvent(req);
    const result = await handler(event);
    const statusCode = result.statusCode || 200;
    const body = result.body ? JSON.parse(result.body) : undefined;
    res.status(statusCode).json(body);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Notes endpoints
app.post("/notes", (req, res) => executeHandler(createNoteHandler, req, res));
app.get("/notes/:noteId", (req, res) => executeHandler(getNoteHandler, req, res));
app.get("/notes", (req, res) => executeHandler(listNotesHandler, req, res));
app.put("/notes/:noteId", (req, res) => executeHandler(updateNoteHandler, req, res));
app.delete("/notes/:noteId", (req, res) => executeHandler(deleteNoteHandler, req, res));
app.post("/notes/:noteId/upload", (req, res) =>
  executeHandler(uploadNoteArtifactHandler, req, res),
);

// Users endpoints
app.get("/me", (req, res) => executeHandler(getMeHandler, req, res));

// Posts endpoints
app.post("/posts", (req, res) => executeHandler(createPostHandler, req, res));
app.get("/posts", (req, res) => executeHandler(listPostsHandler, req, res));
app.post("/posts/:postId/publish", (req, res) => executeHandler(publishPostHandler, req, res));
app.post("/posts/:postId/schedule", (req, res) => executeHandler(schedulePostHandler, req, res));
app.post("/posts/:postId/cancel", (req, res) => executeHandler(cancelPostHandler, req, res));

// Search endpoint
app.get("/search/notes", (req, res) => executeHandler(searchHandler, req, res));

// Drafts endpoint
app.post("/drafts", (req, res) => executeHandler(createDraftHandler, req, res));

// Integrations endpoints
app.get("/integrations", (req, res) => executeHandler(listIntegrationsHandler, req, res));
app.post("/integrations/connect", (req, res) =>
  executeHandler(connectIntegrationHandler, req, res),
);
app.get("/integrations/callback", (req, res) =>
  executeHandler(integrationCallbackHandler, req, res),
);
app.delete("/integrations/:provider", (req, res) =>
  executeHandler(disconnectIntegrationHandler, req, res),
);

// Billing endpoints
app.post("/billing/checkout", (req, res) => executeHandler(billingCheckoutHandler, req, res));
app.post("/billing/portal", (req, res) => executeHandler(billingPortalHandler, req, res));
app.post("/billing/webhook", (req, res) => executeHandler(billingWebhookHandler, req, res));

// Content session endpoint
app.post("/content/session", (req, res) => executeHandler(createContentSessionHandler, req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Noteship API dev server running on http://localhost:${PORT}`);
  console.log(`📝 Using local emulators:`);
  console.log(`   DynamoDB: ${process.env.NOTESHIP_DYNAMODB_ENDPOINT || "not set"}`);
  console.log(`   S3: ${process.env.NOTESHIP_S3_ENDPOINT || "not set"}`);
  console.log(`   SQS: ${process.env.NOTESHIP_SQS_ENDPOINT || "not set"}`);
  console.log(`\n🔐 Auth: Using JWT from Authorization header or fallback local user`);
  console.log(`\n💡 Tip: Attach debugger with NODE_OPTIONS='--inspect' for breakpoints`);
});
