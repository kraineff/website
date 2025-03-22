import { HomeyAPIV2 } from "homey-api";

export type HomeyZone = HomeyAPIV2.ManagerZones.Zone;
export type HomeyZones = Record<string, HomeyZone>;

export type HomeyDevice = HomeyAPIV2.ManagerDevices.Device;
export type HomeyDevices = Record<string, HomeyDevice>;

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
export type HomeyCapabilities = Record<string, HomeyCapability>;

export type HomeyValue = string | number | boolean;

export type AthomStorage = {
    user: {
        homeys: Array<{
            id: string;
        }>;
    };
};