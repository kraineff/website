import PocketBase from "pocketbase";
import { Elysia } from "elysia";
import { z } from "zod";
import { AliceRoutes } from "./alice/routes";

const envSchema = z.object({
    PB_HOST: z.string(),
    PB_USERNAME: z.string(),
    PB_PASSWORD: z.string(),
    HOMEY_ID: z.string(),
    HOMEY_SECRET: z.string()
});
const env = envSchema.parse(Bun.env);
const pb = new PocketBase(env.PB_HOST);
await pb.collection("_superusers").authWithPassword(env.PB_USERNAME, env.PB_PASSWORD);

new Elysia()
    .all("/", () => "Hello World")
    .use(AliceRoutes(env.HOMEY_ID, env.HOMEY_SECRET, pb))
    .listen(3000);