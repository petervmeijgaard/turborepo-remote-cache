import { bearerAuth } from "hono/bearer-auth";
import { Hono } from "hono";
import { env } from "../env.js";
import { getStore } from "@netlify/blobs";

const app = new Hono();

app.use("/*", bearerAuth({ token: env.ADMIN_TOKEN }));

app.delete("/prune/:teamId", async (c) => {
	const { teamId } = c.req.param();

	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const { blobs } = await store.list();

	const deletePromises = blobs.map(async ({ key }) => {
		await store.delete(key);
	});

	await Promise.all(deletePromises);

	return c.text("OK", 200);
});

export default app;
