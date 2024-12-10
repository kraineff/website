import { Elysia } from "elysia";

new Elysia()
    .all("/", () => "Пусто ещё")
    .get("/proxy", async ({ query }) => {
        if (!Bun.env.PROXY_URL || !Bun.env.PROXY_TOKEN || Bun.env.PROXY_TOKEN !== query.token) return "Нет токена";
        const request = await fetch(Bun.env.PROXY_URL + Bun.env.PROXY_TOKEN);
        const proxy = await request.json();
        return `${proxy.tag} = Shadowsocks,${proxy.server},${proxy.server_port},${proxy.method},"${proxy.password}"`;
    })
    .listen(Bun.env.SERVER_PORT ?? 3000);