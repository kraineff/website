import { Elysia, type Static, t } from "elysia";

export type ProxyToken = Static<typeof ProxyToken>;
export const ProxyToken = t.Object({
    app: t.String(),
    proxy: t.String()
});

export const ProxyModels = new Elysia().model({
	"token": ProxyToken,
	"token.query": t.Object({
        token: t.String()
    }),
});