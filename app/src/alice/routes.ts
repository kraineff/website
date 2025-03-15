import { Elysia, t } from "elysia";
import { AliceController } from "./controller";

const UserHeaders = t.Object({
    "authorization": t.TemplateLiteral("Bearer ${string}"),    
    "x-request-id":  t.String({ format: "uuid", default: crypto.randomUUID() }),
    "user-agent":    t.String({ pattern: "Yandex LLC", default: "" })
});

export const AliceRoute = async (clientId: string, clientSecret: string) => {    
    const service = new AliceController(clientId, clientSecret);
    
    return new Elysia({ prefix: "/alice/v1.0" })
        // .onAfterResponse(() => Bun.gc(true))
        .head("/", () => new Response(null, { status: 200 }))
        .group("/user", { headers: UserHeaders }, app => app
            .derive(({ headers }) => ({
                token: headers.authorization.slice(7),
                requestId: headers["x-request-id"]
            }))
            .post("/unlink", async ({ token, requestId }) => {
                await service.userRemove(token);
                return { request_id: requestId };
            })
            .group("/devices", app => app
                .get("/", async ({ token, requestId }) => ({
                    request_id: requestId,
                    payload: await service.getDevices(token)
                }))
                .post("/query", async ({ token, requestId, body }) => ({
                    request_id: requestId,
                    payload: await service.getStates(token, <any>body)
                }))
                .post("/action", async ({ token, requestId, body }) => ({
                    request_id: requestId,
                    payload: await service.setStates(token, <any>body)
                }))
            )
        );
};