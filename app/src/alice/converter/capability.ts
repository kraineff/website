import type { HomeyAPIV2 } from "homey-api";
import type { HomeyCapabilities, HomeyValue } from "../types/homey";
import type { CapabilityState } from "../models";

type Category = "capabilities" | "properties";
type OnGetParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;
type OnGetHandler<YandexValue> = (device: HomeyAPIV2.ManagerDevices.Device) => YandexValue | undefined;
type OnSetHandler<YandexValue> = (value: YandexValue) => Record<string, HomeyValue>;
export type OnSetValueHandler = (capabilityId: string, value: HomeyValue) => Promise<void>;

export class CapabilityConverter<Params extends Record<string, unknown>, GetValue, SetValue> {
	readonly name: string;
	readonly type: string;
	readonly instance: string;
	readonly category: Category;
	private parameters: Params;

	private onGetParamsHandler?: OnGetParamsHandler<Params>;
	private onGetHandler?: OnGetHandler<GetValue>;
	private onSetHandler?: OnSetHandler<SetValue>;

	constructor(name: string, type: string, instance: string) {
		this.name = name;
		this.type = type;
		this.instance = instance;
		this.category = type.split(".")[1] as Category;
		this.parameters = {} as Params;
	}

	setParameters(values: Params & { parse?: OnGetParamsHandler<Params> }) {
		const { parse, ...parameters } = values;
		this.parameters = parameters as Params;

		if (parse) {
			const prevHandler = this.onGetParamsHandler || (() => ({}));
			this.onGetParamsHandler = (capabilities) => ({
				...prevHandler(capabilities),
				...parse(capabilities),
			});
		}

		return this;
	}
	
	getCapabilities<CapabilityValues extends Record<string, HomeyValue>>(
		handler: (values: {
			[K in keyof CapabilityValues]: CapabilityValues[K] | undefined;
		}) => GetValue | undefined
	) {
		const prevHandler = this.onGetHandler || (() => undefined) as OnGetHandler<GetValue>;
		const newHandler = handler;
		
		this.onGetHandler = (device) => {
			const capabilities = device.capabilitiesObj as HomeyCapabilities;
			const capabilityValues = Object
				.entries(capabilities)
				.reduce((values, [_, capability]) => ({
					...values,
					[capability.id]: capability.value ?? undefined,
				}), {} as CapabilityValues);

			const value = newHandler(capabilityValues);
			return value === undefined ? prevHandler(device) : value;
		};
		
		return this;
	}

	getCapability<CapabilityValue extends HomeyValue>(
		capabilityId: string,
		handler?: (value: CapabilityValue) => GetValue | undefined,
	) {
		const prevHandler = this.onGetHandler || (() => undefined) as OnGetHandler<GetValue>;
		const newHandler = handler || ((value) => value as unknown as GetValue);

		this.onGetHandler = (device) => {
			const capabilities = device.capabilitiesObj as HomeyCapabilities;
			const capability = capabilities?.[capabilityId];
			const prevValue = prevHandler(device);

			if (capability?.value === undefined || capability?.value === null) return prevValue;
			if (capability?.type === "boolean" && !capability.getable) return false as GetValue;

			const capabilityValue = capability?.value as CapabilityValue;
			const value = newHandler(capabilityValue);
			return value === undefined ? prevValue : value;
		};

		return this;
	}

	setCapabilities<CapabilityValues extends Record<string, HomeyValue>>(
		handler: (value: SetValue) => CapabilityValues,
	) {
		const prevHandler = this.onSetHandler || (() => ({})) as OnSetHandler<SetValue>;
		const newHandler = handler as OnSetHandler<SetValue>;

		this.onSetHandler = (setValue) =>
			({ ...prevHandler(setValue), ...newHandler(setValue) });

		return this;
	}

	setCapability<CapabilityValue extends HomeyValue>(
		capabilityId: string,
		handler?: (value: SetValue) => CapabilityValue | undefined,
	) {
		const prevHandler = this.onSetHandler || (() => ({})) as OnSetHandler<SetValue>;
		const newHandler = handler || ((value) => value as unknown as CapabilityValue);

		this.onSetHandler = (setValue) => {
			const values = prevHandler(setValue);
			const value = newHandler(setValue);

			if (value === undefined) delete values[capabilityId];
			else values[capabilityId] = value;
			return values;
		};

		return this;
	}

	async onGetParameters(capabilities: HomeyCapabilities) {
		const parameters: Record<string, any> = {
			...this.parameters,
			...this.onGetParamsHandler?.(capabilities),
		};

		const response = {
			type: this.type,
			retrievable: parameters.retrievable ?? true,
			reportable: false,
			parameters: {} as Record<string, unknown>,
		};

		switch (this.instance) {
			case "hsv":
				response.parameters.color_model = this.instance;
				break;
			case "rgb":
				response.parameters.color_model = this.instance;
				break;
			case "temperature_k":
				const temperature_k = parameters.temperature_k;
				temperature_k && (response.parameters.temperature_k = temperature_k);
				break;
			case "scene":
				const scenes = parameters.scenes;
				scenes && (response.parameters.scenes = {
					color_scene: { scenes: scenes.map((id: string) => ({ id })) }
				});
				break;
			default:
				const skip = ["devices.capabilities.on_off", "devices.capabilities.color_setting"];
				if (!skip.includes(this.type)) response.parameters.instance = this.instance;
		}

		const mappings = {
			split: parameters.split,
			random_access: parameters.random_access,
			range: parameters.range,
			unit: parameters.unit && `unit.${parameters.unit}`,
			modes: parameters.modes && parameters.modes.map((value: string) => ({ value })),
			events: parameters.events && parameters.events.map((value: string) => ({ value })),
		};

		Object
			.entries(mappings)
			.forEach(([key, value]) => value !== undefined && (response.parameters[key] = value));

		return response;
	}

	async onGetCapability(device: HomeyAPIV2.ManagerDevices.Device) {
		return this.onGetHandler?.(device);
	}

	async onSetCapability(value: CapabilityState["state"]["value"], handler: OnSetValueHandler) {
		const promises = Object
			.entries(this.onSetHandler?.(value as SetValue) || {})
			.map(async ([capabilityId, value]) => handler(capabilityId, value));

		await Promise.all(promises).catch((error: Error) => {
			const message = error?.message || "";

			if (message.startsWith("Invalid Capability:")) return;
			if (message.startsWith("Not Found: Device with ID")) throw new Error("DEVICE_NOT_FOUND");
			if (message.startsWith("Power on in progress...")) throw new Error("DEVICE_BUSY");

			throw new Error("DEVICE_UNREACHABLE");
		});
	}
}
