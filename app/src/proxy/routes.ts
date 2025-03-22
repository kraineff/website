import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { ProxyModels, ProxyToken } from "./models";

export const ProxyRoutes = async (jwtSecret: string) => {    
    return new Elysia({ prefix: "/proxy" })
        .use(ProxyModels)
        .use(jwt({
            name: "jwt",
            secret: jwtSecret,
            schema: ProxyToken
        }))
        .get("/", async ({ query: { token }, jwt }) => {
            const payload = await jwt.verify(token);
            if (!payload) return "Неверный токен";

            const request = await fetch(payload.proxy);
            const proxy = await request.json();

            switch (payload.app) {
                case "loon": return `${proxy.tag} = Shadowsocks,${proxy.server},${proxy.server_port},${proxy.method},"${proxy.password}"`;
                case "stash": return [
                    "proxies:",
                    `\n  - name: '${proxy.tag}'`,
                    "\n    type: ss",
                    `\n    server: ${proxy.server}`,
                    `\n    port: ${proxy.server_port}`,
                    `\n    cipher: ${proxy.method}`,
                    `\n    password: '${proxy.password}'`,
                ].join("");
                case "surge": return `[Proxy]\n${proxy.tag} = ss, ${proxy.server}, ${proxy.server_port}, encrypt-method=${proxy.method}, password=${proxy.password}, tfo=true, udp-relay=true`;
                default: return new Response("Неизвестное приложение", { status: 400 });
            }
        }, {
            query: "token.query"
        });
};