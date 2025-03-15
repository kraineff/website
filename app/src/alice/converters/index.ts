import { Converter } from "../converter";

export class Converters {
    private cache: Map<string, Converter> = new Map();
    private readonly CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;

    constructor() {
        setInterval(() => this.cache.clear(), this.CACHE_CLEANUP_INTERVAL);
    }

    async get(converterName: string) {
        const name = converterName.replace("homey:app:", "");
        const directory = import.meta.dir + (!name.includes(":") ? "/capabilities/" : "/devices/");
        const path = directory + name + ".ts";

        if (this.cache.has(name))
            return this.cache.get(name) || Converter.create("unknown");

        if (await Bun.file(path).exists()) {
            const converter = (await import(path)).default as Converter;
            this.cache.set(name, converter);
            return converter;
        }

        return Converter.create("unknown");
    }

    async merge(converterNames: string[]) {
        const converter = Converter.create("merge");
        await Promise.all(converterNames.map(async name => converter.use(await this.get(name))));
        return converter;
    }
}