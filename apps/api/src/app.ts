import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import { config } from "./config";
import { sl } from "./lib/sl";

const app = new Hono()
  .use("/*", serveStatic({ root: "./public" }))
  .get("/api/sl", async c => c.json(
    await sl(config),
  ))
  .get("/api/smhi", c => c.text("Hello Node.js!"));

serve({
  fetch: app.fetch,
  port: 8080,
});

export type AppType = typeof app
