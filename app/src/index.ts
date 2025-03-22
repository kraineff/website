import { Elysia } from "elysia";
import { AliceRoutes } from "./alice/routes";
import { ProxyRoutes } from "./proxy/routes";
import { z } from "zod";

const envSchema = z.object({
    HOMEY_ID: z.string(),
    HOMEY_SECRET: z.string(),
    JWT_SECRET: z.string().uuid()
});

const env = envSchema.parse(Bun.env);

new Elysia()
    .all("/", () => "Hello World")
    .use(AliceRoutes(env.HOMEY_ID, env.HOMEY_SECRET))
    .use(ProxyRoutes(env.JWT_SECRET))
    .listen(3000);