import { Hono } from "hono";
import { logger } from "hono/logger";

import { Context as NetlifyContext } from "@netlify/functions";
import artifacts from "./routes/artifacts.js";
import admin from "./routes/admin.js";

const app = new Hono();

app.use(logger());

app.route("/v8/artifacts", artifacts);
app.route("/admin", admin);

app.get("/", c => {
	return c.body("Hello Hono!");
});

export async function serve(req: Request, context: NetlifyContext) {
	app.fetch(req, { context });
}
