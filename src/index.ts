import { Elysia } from "elysia";

new Elysia()
    .all("/", () => "Пусто ещё")
    .get("/proxy", async ({ query }) => {
        if (!Bun.env.PROXY_URL || !Bun.env.PROXY_TOKEN) return "Нет переменных";
        if (query.token !== Bun.env.TOKEN) return "Неверный токен";
        if (!query.app) return "Неверное приложение"

        const request = await fetch(Bun.env.PROXY_URL + Bun.env.PROXY_TOKEN);
        const proxy = await request.json();

        if (query.app === "loon") return `${proxy.tag} = Shadowsocks,${proxy.server},${proxy.server_port},${proxy.method},"${proxy.password}"`;
        else if (query.app === "surge") return `[Proxy]\n${proxy.tag} = ss, ${proxy.server}, ${proxy.server_port}, encrypt-method=${proxy.method}, password=${proxy.password}, tfo=true, udp-relay=true`;
        else if (query.app === "stash") return [
            "proxies:",
            `\n  - name: '${proxy.tag}'`,
            "\n    type: ss",
            `\n    server: ${proxy.server}`,
            `\n    port: ${proxy.server_port}`,
            `\n    cipher: ${proxy.method}`,
            `\n    password: '${proxy.password}'`,
        ].join("");
        else return "Неизвестное приложение"
    })
    .listen(Bun.env.SERVER_PORT ?? 3000);