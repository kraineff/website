import { Elysia } from "elysia";
import { AliceRoute } from "./alice/routes";
import { ProxyRoute } from "./proxy/routes";
import { z } from "zod";

const envSchema = z.object({
    HOMEY_ID: z.string(),
    HOMEY_SECRET: z.string(),
    JWT_SECRET: z.string().uuid()
});

const env = envSchema.parse(Bun.env);

new Elysia()
    .all("/", () => "Hello World")
    .use(AliceRoute(env.HOMEY_ID, env.HOMEY_SECRET))
    .use(ProxyRoute(env.JWT_SECRET))
    .listen(3000);