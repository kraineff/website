import type { HomeyAPIV2 } from "homey-api";
import { CapabilityConverter, type OnSetValueHandler } from "./capability";
import { getDeviceType } from "./utils";
import type {
	CapabilityState,
	Device,
	DeviceActionCapabilityState,
	DeviceQueryResult,
} from "../models";
import type { HomeyCapabilities } from "../types/homey";
import { YCapability, YDevice, YEvent, YInstance, YMode, YUnit } from "../types/yandex";

type CapabilityBuilder<Params, GetValue, SetValue> = (
	converter: CapabilityConverter<Params & { retrievable?: boolean }, GetValue, SetValue>,
) => typeof converter;

export class Converter {
	readonly name: string;
	private deviceType?: YDevice;
	private converters = new Map<string, CapabilityConverter<any, any, any>>();

	constructor(name: string, deviceType?: YDevice) {
		this.name = name;
		this.deviceType = deviceType;
	}

	static create(name: string, deviceType?: YDevice) {
		return new Converter(name, deviceType);
	}

	use(converter: Converter) {
		const converters = new Map(this.converters);
		const convertersNew = new Map(converter.converters);

		convertersNew.forEach((converter, key) => {
			const converterName = converters.get(key)?.name;

			converterName &&
				converters.forEach(
					(converter, key) => converter.name === converterName && converters.delete(key),
				);

			converters.set(key, converter);
		});

		this.deviceType = converter.deviceType || this.deviceType;
		this.converters = converters;
		return this;
	}

	private createConverter<Params extends Record<string, any>, GetValue, SetValue>(
		type: YCapability,
		instance: YInstance,
		run: CapabilityBuilder<Params, GetValue, SetValue>,
	) {
		this.converters.set(
			`${type},${instance}`,
			run(new CapabilityConverter<Params, GetValue, SetValue>(this.name, type, instance)),
		);
		return this;
	}

	createState(run: CapabilityBuilder<{ split?: boolean }, boolean, boolean>) {
		return this.createConverter(YCapability.on_off, YInstance.on, run);
	}

	createColor<
		Instance extends YInstance,
		Value = Instance extends YInstance.hsv ? {
			h: number;
			s: number;
			v: number;
		} : Instance extends YInstance.scene ? string : number
	>(
		instance: Instance,
		run: CapabilityBuilder<
			{
				temperature_k?: {
					min: number;
					max: number;
				};
				scenes?: string[];
			},
			Value,
			Value
		>,
	) {
		return this.createConverter(YCapability.color_setting, instance, run);
	}

	createVideo(run: CapabilityBuilder<{ protocols: string[] }, { protocols: string[] }, null>) {
		return this.createConverter(YCapability.video_stream, YInstance.get_stream, run);
	}

	createMode(instance: YInstance, run: CapabilityBuilder<{ modes: YMode[] }, string, string>) {
		return this.createConverter(YCapability.mode, instance, run);
	}

	createRange(
		instance: YInstance,
		run: CapabilityBuilder<
			{
				unit?: YUnit;
				random_access?: boolean;
				range?: {
					min: number;
					max: number;
					precision: number;
				};
			},
			number,
			number
		>,
	) {
		return this.createConverter(YCapability.range, instance, run);
	}

	createToggle(instance: YInstance, run: CapabilityBuilder<Record<string, unknown>, boolean, boolean>) {
		return this.createConverter(YCapability.toggle, instance, run);
	}

	createFloat(instance: YInstance, run: CapabilityBuilder<{ unit?: YUnit }, number, null>) {
		return this.createConverter(YCapability.float, instance, run);
	}

	createEvent(instance: YInstance, run: CapabilityBuilder<{ events: YEvent[] }, string, null>) {
		return this.createConverter(YCapability.event, instance, run);
	}

	async getDevice(
		device: HomeyAPIV2.ManagerDevices.Device,
		zones: Record<string, HomeyAPIV2.ManagerZones.Zone>,
	): Promise<Device> {
		const response: Device = {
			id: device.id,
			name: device.name,
			room: zones[device.zone].name,
			type: this.deviceType ? `devices.types.${this.deviceType}`: getDeviceType(device),
			custom_data: [],
			capabilities: [],
			properties: [],
		};

		// Специальные команды
		const note = device.note;
		if (note?.includes("@hidden;")) throw new Error("Устройство скрыто");
		if (note?.includes("@type="))
			response.type = `devices.types.${note.split("@type=")[1].split(";")[0]}`;

		// Конвертация свойств
		let capabilityColor: any;
		const capabilities = device.capabilitiesObj as HomeyCapabilities;

		await Promise.all(
			[...this.converters.values()].map(async (converter) => {
				const capability = await converter.onGetParameters(capabilities);
				response.custom_data.push(converter.name);

				if (capability.type === YCapability.color_setting) {
					if (!capabilityColor) capabilityColor = capability;
					else
						capabilityColor.parameters = {
							...capabilityColor.parameters,
							...capability.parameters,
						};
					return;
				}

				response[converter.category].push(capability);
			}),
		);

		capabilityColor && response.capabilities.push(capabilityColor);
		response.custom_data = [...new Set(response.custom_data)];
		if (response.custom_data.length) return response;
		throw new Error("Устройство не поддерживается");
	}

	async getStates(devices: Record<string, HomeyAPIV2.ManagerDevices.Device>, deviceId: string) {
		const device = devices[deviceId];
		const result: DeviceQueryResult = {
			id: deviceId,
			capabilities: [],
			properties: [],
		};

		if (!device) result.error_code = "DEVICE_NOT_FOUND";
		else if (device && (!device.ready || !device.available))
			result.error_code = "DEVICE_UNREACHABLE";
		else {
			await Promise.all(
				[...this.converters.values()].map(async (converter) => {
					const value = await converter.onGetCapability(device);
					if (value === undefined) return;

					result[converter.category]?.push({
						type: converter.type,
						state: {
							instance: converter.instance,
							value,
						},
					});
				}),
			);
		}

		return result;
	}

	async setStates(
		states: Array<CapabilityState>,
		handler: OnSetValueHandler,
	): Promise<DeviceActionCapabilityState[]> {
		return await Promise.all(
			states.map(async ({ type, state: { instance, value } }) => {
				const converter = this.converters.get(`${type},${instance}`);
				const result = await converter
					?.onSetCapability(value, handler)
					.then(() => ({ status: "DONE" }))
					.catch((error: Error) => ({ status: "ERROR", error_code: error.message }));

				return {
					type,
					state: {
						instance,
						action_result: result || { status: "ERROR", error_code: "INVALID_ACTION" },
					},
				};
			}),
		);
	}
}
