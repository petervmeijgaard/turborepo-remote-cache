import { bearerAuth } from "hono/bearer-auth";
import { Hono } from "hono";
import { env } from "../env.js";
import { getStore } from "@netlify/blobs";

const app = new Hono();

app.use("/*", bearerAuth({ token: env.TURBO_TOKEN }));

app.post("/events", (c) => c.text("", 200));

app.get("/status", (c) => c.json({ status: "enabled" }, 200));

app.on("HEAD", "/:id", async (c) => {
	const { id } = c.req.param();
	const { teamId } = c.req.query();

	if (!id || !teamId) {
		return c.text("Invalid request", 400);
	}

	const key = encodeURIComponent(id);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const { blobs } = await store.list();

	const foundBlob = blobs.find((blob) => blob.key === key);

	if (!foundBlob) {
		return c.text("Artifact not found", 404);
	}

	return c.text("OK", 200);
});

app.get("/:id", async (c) => {
	const { id } = c.req.param();
	const { teamId } = c.req.query();

	if (!id || !teamId) {
		return c.text("Query string should have required property 'teamId'", 400);
	}

	const key = encodeURIComponent(id);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const blob = await store.get(key, { type: "arrayBuffer" });

	if (!blob) {
		return c.text("Artifact not found", 404);
	}

	const headers = new Headers();

	headers.set("Content-Type", "application/octet-stream");
	headers.set("Content-Length", blob.byteLength.toString());
	headers.set(
		"Netlify-CDN-Cache-Control",
		"public, s-maxage=31536000, immutable",
	);
	headers.set("Netlify-Vary", "header=Authorization,query=teamId");

	return c.body(blob, { headers });
});

app.put("/:id", async (c) => {
	const { id } = c.req.param();
	const { teamId } = c.req.query();

	if (!id || !teamId) {
		return c.text("Query string should have required property 'teamId'", 400);
	}

	const key = encodeURIComponent(id);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const blob = await c.req.arrayBuffer();

	if (!blob) {
		return c.text("Invalid request", 400);
	}

	await store.set(key, blob);

	return c.text("OK", 200);
});

export default app;
