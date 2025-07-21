import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import { config } from "./config";
import { sl } from "./lib/sl";
import { smhi } from "./lib/smhi";

const app = new Hono()
  .use("/*", serveStatic({ root: "./public" }))
  .get("/api/sl", async c => c.json(
    await sl(config),
  ))
  .get("/api/smhi", async c => c.json(
    await smhi(config),
  ));

serve({
  fetch: app.fetch,
  port: 8080,
});

export type AppType = typeof app
