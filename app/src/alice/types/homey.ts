import type { HomeyAPIV2 } from "homey-api";

export type HomeyAPI = {
	id: string;
	devices: {
		getDevices: () => Promise<HomeyDevices>;
		setCapabilityValue: (params: {
			deviceId: string;
			capabilityId: string;
			value: HomeyValue;
		}) => Promise<void>;
	};
	zones: {
		getZones: () => Promise<HomeyZones>;
	};
};

export type HomeyZone = HomeyAPIV2.ManagerZones.Zone;
export type HomeyZones = Record<string, HomeyZone>;

export type HomeyDevice = HomeyAPIV2.ManagerDevices.Device;
export type HomeyDevices = Record<string, HomeyDevice>;

export type HomeyDeviceSetting = {
	value: HomeyValue;
};
export type HomeyDeviceSettings = Record<string, HomeyDeviceSetting>;

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: HomeyValue };
export type HomeyCapabilities = Record<string, HomeyCapability>;

export type HomeyValue = string | number | boolean;

export type AthomStorage = {
	user: {
		homeys: Array<{
			id: string;
		}>;
	};
};
