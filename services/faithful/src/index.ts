import { Elysia } from "elysia";

new Elysia()
    .all("/", () => "Faithful will be available within 1-2 months.")
    .listen(3000);