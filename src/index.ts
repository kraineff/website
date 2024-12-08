import { Elysia } from "elysia";

new Elysia()
    .all("/", () => "Пусто ещё")
    .get("/proxy", async ({ query }) => {
        if (!Bun.env.PROXY_URL || !Bun.env.PROXY_TOKEN || Bun.env.PROXY_TOKEN !== query.token) return "Нет токена";
        const request = await fetch(Bun.env.PROXY_URL + Bun.env.PROXY_TOKEN);
        const proxy = await request.json();

        const fileContent = [
            "proxies:",
            `\n  - name: ${proxy.tag}`,
            "\n    type: ss",
            `\n    server: ${proxy.server}`,
            `\n    port: ${proxy.server_port}`,
            "\n    cipher: AEAD_CHACHA20_POLY1305",
            `\n    password: "${proxy.password}"`,
        ];
        const file = Bun.file("proxy.yaml");
        await Bun.write(file, fileContent.join());
        return file;
    })
    .listen(Bun.env.SERVER_PORT ?? 3000);