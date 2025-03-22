import { HomeyAPIV2 } from "homey-api";
import { CapabilityConverter, SetValueHandler } from "./capability";
import { getDeviceType } from "./utils";
import { CapabilityState, Device, DeviceActionCapabilityState, DeviceQueryResult } from "../models"
import { HomeyCapabilities } from "../types/homey";

type CapabilityBuilder<Params, SetValue> =
    (converter: CapabilityConverter<Params & { retrievable?: boolean }, SetValue>) => typeof converter;

export class Converter {
    private type?: string;
    private converters = new Map<string, CapabilityConverter<any, any>>();

    constructor(readonly name: string, type?: string) {
        this.type = type;
    }

    static create(name: string, type?: string) {
        return new Converter(name, type);
    }

    use(converter: Converter) {
        const converters = new Map(this.converters);
        const convertersNew = new Map(converter.converters);

        convertersNew.forEach((converter, key) => {
            const converterName = converters.get(key)?.name;

            converterName && converters.forEach((converter, key) =>
                converter.name === converterName && converters.delete(key));
            
            converters.set(key, converter);
        });

        this.type = converter.type || this.type;
        this.converters = converters;
        (converter as any) = null;
        return this;
    }

    private createConverter<Params extends Record<string, any>, SetValue>(
        type: string,
        instance: string,
        run: CapabilityBuilder<Params, SetValue>
    ) {
        this.converters.set(`${type},${instance}`, run(new CapabilityConverter<Params, SetValue>(this.name, type, instance)));
        return this;
    }

    createState(run: CapabilityBuilder<{ split?: boolean }, boolean>) {
        return this.createConverter("devices.capabilities.on_off", "on", run);
    }

    createColor(instance: string, run: CapabilityBuilder<{
        temperature_k?: {
            min: number;
            max: number;
        };
        scenes?: string[];
    }, any>) {
        return this.createConverter("devices.capabilities.color_setting", instance, run);
    }

    createVideo(run: CapabilityBuilder<{ protocols: string[] }, { protocols: string[] }>) {
        return this.createConverter("devices.capabilities.video_stream", "get_stream", run);
    }

    createMode(instance: string, run: CapabilityBuilder<{ modes: string[] }, string>) {
        return this.createConverter("devices.capabilities.mode", instance, run);
    }

    createRange(instance: string, run: CapabilityBuilder<{
        unit?: string;
        random_access?: boolean;
        range?: {
            min: number;
            max: number;
            precision: number;
        };
    }, number>) {
        return this.createConverter("devices.capabilities.range", instance, run);
    }

    createToggle(instance: string, run: CapabilityBuilder<{}, boolean>) {
        return this.createConverter("devices.capabilities.toggle", instance, run);
    }

    createFloat(instance: string, run: CapabilityBuilder<{ unit?: string }, number>) {
        return this.createConverter("devices.properties.float", instance, run);
    }

    createEvent(instance: string, run: CapabilityBuilder<{ events: string[] }, string>) {
        return this.createConverter("devices.properties.event", instance, run);
    }

    async getDevice(device: HomeyAPIV2.ManagerDevices.Device, zones: Record<string, HomeyAPIV2.ManagerZones.Zone>) {
        const response: Device = {
            id: device.id,
            name: device.name,
            room: zones[device.zone].name,
            type: this.type || getDeviceType(device),
            custom_data: [], capabilities: [], properties: []
        };

        // Специальные команды
        const note = device.note;
        if (note && note.includes("@hidden;")) return;
        if (note && note.includes("@type="))
            response.type = `devices.types.${note.split("@type=")[1].split(";")[0]}`;

        // Конвертация свойств
        let capabilityColor: any;
        const capabilities = device.capabilitiesObj as HomeyCapabilities;

        await Promise.all(
            this.converters.values().map(async converter => {
                const capability = await converter.onGetParameters(capabilities);
                response.custom_data.push(converter.name);
    
                if (capability.type === "devices.capabilities.color_setting") {
                    if (!capabilityColor) capabilityColor = capability;
                    else capabilityColor.parameters = { ...capabilityColor.parameters, ...capability.parameters };
                    return;
                }
    
                response[converter.category].push(capability);
            })
        );

        capabilityColor && response.capabilities.push(capabilityColor);
        response.custom_data = [...new Set(response.custom_data)];                
        return response.custom_data.length ? response : undefined;
    }

    async getStates(devices: Record<string, HomeyAPIV2.ManagerDevices.Device>, deviceId: string) {
        const device = devices[deviceId];
        const result: DeviceQueryResult = {
            id: deviceId,
            capabilities: [], properties: []
        };
        
        if (!device) result.error_code = "DEVICE_NOT_FOUND";
        else if (device && (!device.ready || !device.available)) result.error_code = "DEVICE_UNREACHABLE";
        else {
            await Promise.all(
                this.converters.values().map(async converter => {
                    const value = await converter.onGetCapability(device);
                    if (value === undefined) return;

                    result[converter.category]?.push({
                        type: converter.type,
                        state: {
                            instance: converter.instance,
                            value
                        }
                    });
                })
            );
        }

        return result;
    }

    async setStates(states: Array<CapabilityState>, handler: SetValueHandler): Promise<DeviceActionCapabilityState[]> {
        return await Promise.all(
            states.map(async ({ type, state: { instance, value } }) => {
                const converter = this.converters.get(`${type},${instance}`);
                const result = await converter?.onSetCapability(value, handler)
                    .then(() => ({ status: "DONE" }))
                    .catch((error: Error) => ({ status: "ERROR", error_code: error.message }));

                return {
                    type,
                    state: {
                        instance,
                        action_result: result || { status: "ERROR", error_code: "INVALID_ACTION" }
                    }
                };
            })
        );
    }
}