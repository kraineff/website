import PocketBase from "pocketbase";
import { Elysia } from "elysia";
import { AliceController } from "./controller";
import { AliceModels } from "./models";

export const AliceRoutes = async (clientId: string, clientSecret: string, pocketbase: PocketBase) => {
	const service = new AliceController(clientId, clientSecret, pocketbase);

	return new Elysia({ prefix: "/alice/v1.0" })
		.use(AliceModels)
		.onError(({ error }) => console.error(error))
		.head("/", () => new Response(null, { status: 200 }))
		.group("/user", { headers: "user.headers" }, app => app
			.resolve(({ headers }) => ({
				token: headers.authorization.slice(7),
				requestId: headers["x-request-id"],
			}))
			.post("/unlink", async ({ token, requestId }) => {
				await service.userRemove(token);
				return { request_id: requestId };
			}, {
				response: "user.unlink",
			})
			.group("/devices", (app) => app
				.get("/", async ({ token, requestId }) => ({
					request_id: requestId,
					payload: await service.getDevices(token),
				}), {
					response: "user.devices.response",
				})
				.post("/query", async ({ token, requestId, body }) => ({
					request_id: requestId,
					payload: {
						devices: await service.getStates(token, body.devices),
					},
				}), {
					body: "user.devices.query",
					response: "user.devices.query.response",
				})
				.post("/action", async ({ token, requestId, body }) => ({
					request_id: requestId,
					payload: {
						devices: await service.setStates(token, body.payload.devices),
					},
				}), {
					body: "user.devices.action",
					response: "user.devices.action.response",
				})
			)
		);
};
