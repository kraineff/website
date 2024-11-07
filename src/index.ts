import { Elysia } from "elysia";

new Elysia()
    .all("/", () => "Пусто ещё")
    .listen(Bun.env.SERVER_PORT ?? 3000);