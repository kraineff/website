import { HomeyAPIV2 } from "homey-api";
import { HomeyCapabilities } from "../types";
import { makeStateBody } from "./utils";

type ParamsHandler<Params> = (capabilities: HomeyCapabilities) => Partial<Params>;
type Category = "capabilities" | "properties";

export class CapabilityConverter<Params extends Record<string, unknown>, SetValue> {
	readonly category: Category;
	private parameters: Params = {} as Params;

	private onParamsHandler?: ParamsHandler<Params>;
	private onGetHandler?: (device: HomeyAPIV2.ManagerDevices.Device) => SetValue | undefined;
	private onSetHandler?: (value: SetValue) => Record<string, unknown>;

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

	getCapability<ValueType>(
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

				const newValue = newHandler(capability.value);
				if (newValue === "@break") return undefined;
				else if (newValue === "@prev") return value;
				else if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
				else if (typeof newValue === "object" && typeof value === "object")
					return { ...value, ...newValue } as SetValue;
				else return newValue as SetValue;
			} catch (error) {
				return undefined;
			}
		};
		return this;
	}

	getSetting<ValueType>(
		settingId: string,
		handler?: (value: ValueType) => SetValue | "@prev" | "@break",
	) {
		const currentHandler = this.onGetHandler || (() => undefined);
		const newHandler = handler ?? ((value) => value as unknown as SetValue);

		this.onGetHandler = (device) => {
			try {
				const setting = (device.settings as Record<string, any>)?.[settingId];
				const value = currentHandler(device);

				if (!setting || setting.value === undefined || setting.value === null) return value;

				const newValue = newHandler(setting);
				if (newValue === "@break") return undefined;
				else if (newValue === "@prev") return value;
				else if (typeof newValue === "number") return Math.abs(newValue) as SetValue;
				else if (typeof newValue === "object" && typeof value === "object")
					return { ...value, ...newValue } as SetValue;
				else return newValue as SetValue;
			} catch (error) {
				return undefined;
			}
		};
		return this;
	}

	setCapability<ValueType>(
		capabilityId: string,
		handler?: (value: SetValue) => ValueType | "@break",
	) {
		const currentHandler = this.onSetHandler ?? (() => ({}) as any);
		const newHandler = handler ?? ((value) => value as unknown as ValueType);

		this.onSetHandler = (setValue) => {
			try {
				const values = currentHandler(setValue);
				const newValue = newHandler(setValue);
				values[capabilityId] =
					newValue === "@break" || newValue === null || newValue === undefined
						? undefined
						: newValue;
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
		const value = this.onGetHandler ? this.onGetHandler(device) : undefined;
		return value !== undefined ? makeStateBody(this.type, this.instance, { value }) : value;
	}

	async onSetCapability(value: any, handler: (capabilityId: string, value: any) => Promise<any>) {
		const values = Object.entries(this.onSetHandler ? this.onSetHandler(value) : {});
		const actionResult = await Promise.all(
			values.map(
				async ([capabilityId, value]) => value !== undefined && handler(capabilityId, value),
			),
		)
			.then(() => ({ status: "DONE" }))
			.catch((error: Error) => {
				const errorMsg = error?.message || "";
				const result = { status: "ERROR", error_code: "DEVICE_UNREACHABLE" };
				console.log(errorMsg);

				if (errorMsg.startsWith("Invalid Capability:")) return { status: "DONE" };
				if (errorMsg.startsWith("Not Found: Device with ID"))
					result.error_code = "DEVICE_NOT_FOUND";
				if (errorMsg.startsWith("Power on in progress...")) result.error_code = "DEVICE_BUSY";

				return result;
			});

		return makeStateBody(this.type, this.instance, { action_result: actionResult });
	}
}
