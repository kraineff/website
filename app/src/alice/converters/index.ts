import { Converter } from "../converter";
import { CapabilityConverters } from "./capability";
import { DeviceConverters } from "./device";

export class Converters {
	private converters: Record<string, () => Converter> = {
		...CapabilityConverters,
		...DeviceConverters,
	};
	private cache: Map<string, Converter> = new Map();
	private readonly CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000;

	constructor() {
		setInterval(() => this.cache.clear(), this.CACHE_CLEANUP_INTERVAL);
	}

	async get(converterName: string) {
		const name = converterName.replace("homey:app:", "");

		if (this.cache.has(name)) return this.cache.get(name) || Converter.create("unknown");

		if (name in this.converters) {
			const converter = this.converters[name]();
			this.cache.set(name, converter);
			return converter;
		}

		return Converter.create("unknown");
	}

	async merge(converterNames: string[]) {
		const converter = Converter.create("merge");
		await Promise.all(converterNames.map(async (name) => converter.use(await this.get(name))));
		return converter;
	}
}
