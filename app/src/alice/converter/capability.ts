import type { HomeyAPIV2 } from "homey-api";
import type { HomeyCapabilities, HomeyDeviceSettings, HomeyValue } from "../types/homey";
import type { CapabilityState } from "../models";

export type SetValueHandler = (capabilityId: string, value: HomeyValue) => Promise<void>;
export type OnSetValueHandler<SetValue> = (value: SetValue) => Record<string, HomeyValue>;

type ParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;
type Category = "capabilities" | "properties";

export class CapabilityConverter<Params extends Record<string, unknown>, SetValue> {
	readonly category: Category;
	private parameters: Params = {} as Params;

	private onParamsHandler?: ParamsHandler<Params>;
	private onGetHandler?: (device: HomeyAPIV2.ManagerDevices.Device) => SetValue | undefined;
	private onSetHandler?: OnSetValueHandler<SetValue>;

	constructor(
		readonly name: string,
		readonly type: string,
		readonly instance: string
	) {
		this.category = type.split(".")[1] as Category;
	}

	setParameters(values: Params & { parse?: ParamsHandler<Params> }) {
		const { parse, ...parameters } = values;
		this.parameters = parameters as Params;

		if (parse) {
			const currentHandler = this.onParamsHandler || (() => ({}));
			this.onParamsHandler = (capabilities) => ({
				...currentHandler(capabilities),
				...parse(capabilities),
			});
		}

		return this;
	}

	getCapability<ValueType extends HomeyValue>(
		capabilityId: string,
		handler?: (value: ValueType) => SetValue | "@prev" | "@break",
	) {
		const currentHandler = this.onGetHandler || (() => undefined);
		const newHandler = handler ?? ((value) => value as unknown as SetValue);

		this.onGetHandler = (device) => {
			try {
				const capability = (device.capabilitiesObj as HomeyCapabilities)?.[capabilityId];
				const value = currentHandler(device);

				if (!capability || capability.value === undefined || capability.value === null)
					return value;

				if (capability.type === "boolean" && capability.getable === false) return false as SetValue;

				const newValue = newHandler(capability.value as ValueType);
				if (newValue === "@break") return undefined;
				if (newValue === "@prev") return value;
				if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
				if (typeof newValue === "object" && typeof value === "object")
					return { ...value, ...newValue } as SetValue;

				return newValue as SetValue;
			} catch (error) {
				return undefined;
			}
		};
		return this;
	}

	getSetting<ValueType extends HomeyValue>(
		settingId: string,
		handler?: (value: ValueType) => SetValue | "@prev" | "@break",
	) {
		const currentHandler = this.onGetHandler || (() => undefined);
		const newHandler = handler ?? ((value) => value as unknown as SetValue);

		this.onGetHandler = (device) => {
			try {
				const setting = (device.settings as HomeyDeviceSettings)?.[settingId];
				const value = currentHandler(device);

				if (!setting || setting.value === undefined || setting.value === null) return value;

				const newValue = newHandler(setting.value as ValueType);
				if (newValue === "@break") return undefined;
				if (newValue === "@prev") return value;
				if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
				if (typeof newValue === "object" && typeof value === "object")
					return { ...value, ...newValue } as SetValue;
				
				return newValue as SetValue;
			} catch (error) {
				return undefined;
			}
		};
		return this;
	}

	setCapability<ValueType extends HomeyValue>(
		capabilityId: string,
		handler?: (value: SetValue) => ValueType | "@break",
	) {
		const currentHandler = this.onSetHandler ?? (() => ({})) as OnSetValueHandler<SetValue>;
		const newHandler = handler ?? ((value) => value as unknown as ValueType);

		this.onSetHandler = (setValue) => {
			try {
				const values = currentHandler(setValue);
				const newValue = newHandler(setValue);

				if (newValue === "@break" || newValue === null || newValue === undefined)
					delete values[capabilityId];
				else values[capabilityId] = newValue;
				return values;
			} catch (error) {
				return {};
			}
		};

		return this;
	}

	async onGetParameters(capabilities: HomeyCapabilities) {
		const parameters: Record<string, any> = {
			...this.parameters,
			...this.onParamsHandler?.(capabilities),
		};

		return {
			type: this.type,
			retrievable: parameters.retrievable ?? true,
			reportable: false,
			parameters: {
				...(this.type !== "devices.capabilities.on_off" &&
					this.type !== "devices.capabilities.color_setting" && {
						instance: this.instance,
					}),
				...((this.instance === "hsv" || this.instance === "rgb") && {
					color_model: this.instance,
				}),
				...(parameters.temperature_k !== undefined &&
					this.instance === "temperature_k" && {
						temperature_k: parameters.temperature_k,
					}),
				...(parameters.scenes !== undefined &&
					this.instance === "scene" && {
						color_scene: { scenes: parameters.scenes.map((id: string) => ({ id })) },
					}),
				...(parameters.split !== undefined && {
					split: parameters.split,
				}),
				...(parameters.random_access !== undefined && {
					random_access: parameters.random_access,
				}),
				...(parameters.range !== undefined && {
					range: parameters.range,
				}),
				...(parameters.unit !== undefined && {
					unit: `unit.${parameters.unit}`,
				}),
				...(parameters.modes !== undefined && {
					modes: parameters.modes.map((value: string) => ({ value })),
				}),
				...(parameters.events !== undefined && {
					events: parameters.events.map((value: string) => ({ value })),
				}),
			},
		};
	}

	async onGetCapability(device: HomeyAPIV2.ManagerDevices.Device) {
		return this.onGetHandler?.(device);
	}

	async onSetCapability(value: CapabilityState["state"]["value"], handler: SetValueHandler) {
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
