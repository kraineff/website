import type { HomeyAPIV2 } from "homey-api";
import { YDevice } from "../types/yandex";

export function getDeviceType(device: HomeyAPIV2.ManagerDevices.Device) {
	const virtualClass = device.virtualClass;
	const icon = device.iconOverride;

	if (virtualClass) {
		return (
			(virtualClass === "light" && icon && getDeviceTypeByIcon(icon)) ||
			getDeviceTypeByClass(virtualClass)
		);
	}

	return (icon && getDeviceTypeByIcon(icon)) || getDeviceTypeByClass(device.class);
}

function getDeviceTypeByClass(deviceClass: string) {
	switch (deviceClass) {
		case "amplifier": return YDevice.media_device;
		case "blinds": return YDevice.openable_curtain;
		case "button": return YDevice.sensor_button;
		case "camera": return YDevice.camera;
		case "coffeemachine": return YDevice.cooking_coffee_maker;
		case "curtain": return YDevice.openable_curtain;
		case "doorbell": return YDevice.sensor_button;
		case "fan": return YDevice.ventilation_fan;
		case "garagedoor": return YDevice.openable;
		case "heater": return YDevice.thermostat;
		case "homealarm": return YDevice.sensor;
		case "kettle": return YDevice.cooking_kettle;
		case "light": return YDevice.light;
		case "lock": return YDevice.openable;
		case "other": return YDevice.other;
		case "remote": return YDevice.media_device_tv;
		case "sensor": return YDevice.sensor;
		case "socket": return YDevice.socket;
		case "speaker": return YDevice.media_device;
		case "solarpanel": return YDevice.other;
		case "sunshade": return YDevice.openable_curtain;
		case "thermostat": return YDevice.thermostat;
		case "tv": return YDevice.media_device_tv;
		case "vacuumcleaner": return YDevice.vacuum_cleaner;
		case "windowcoverings": return YDevice.openable_curtain;

		// >=12.0.0
		case "airconditioning": return YDevice.thermostat_ac;
		case "bicycle": return YDevice.other;
		case "battery": return YDevice.sensor;
		case "car": return YDevice.other;
		case "boiler": return YDevice.thermostat;
		case "dehumidifier": return YDevice.humidifier;
		case "dishwasher": return YDevice.dishwasher;
		case "diffuser": return YDevice.purifier;
		case "evcharger": return YDevice.sensor;
		case "dryer": return YDevice.washing_machine;
		case "cooktop": return YDevice.cooking;
		case "faucet": return YDevice.openable_valve;
		case "fireplace": return YDevice.thermostat;
		case "freezer": return YDevice.cooking;
		case "fridge_and_freezer": return YDevice.cooking;
		case "fridge": return YDevice.cooking;
		case "gameconsole": return YDevice.other;
		case "grill": return YDevice.cooking;
		case "heatpump": return YDevice.thermostat;
		case "hood": return YDevice.ventilation;
		case "humidifier": return YDevice.humidifier;
		case "mediaplayer": return YDevice.media_device;
		case "airtreatment": return YDevice.purifier;
		case "lawnmower": return YDevice.other;
		case "mop": return YDevice.other;
		case "oven": return YDevice.cooking;
		case "multicooker": return YDevice.cooking_multicooker;
		case "airpurifier": return YDevice.purifier;
		case "petfeeder": return YDevice.pet_feeder;
		case "scooter": return YDevice.other;
		case "radiator": return YDevice.thermostat;
		case "settopbox": return YDevice.media_device_tv_box;
		case "shutterblinds": return YDevice.openable_curtain;
		case "fryer": return YDevice.cooking;
		case "smokealarm": return YDevice.sensor_smoke;
		case "vehicle": return YDevice.other;
		case "washer": return YDevice.washing_machine;
		case "airfryer": return YDevice.cooking;
		case "washer_and_dryer": return YDevice.washing_machine;
		case "waterpurifier": return YDevice.other;
		case "waterheater": return YDevice.thermostat;
		case "oven_and_microwave": return YDevice.cooking;
		case "microwave": return YDevice.cooking;
		case "watervalve": return YDevice.openable_valve;
		case "sprinkler": return YDevice.openable_valve;
		case "siren": return YDevice.sensor;
		case "networkrouter": return YDevice.other;
		default: return YDevice.other;
	}
}

function getDeviceTypeByIcon(icon: string) {
	if (["light-led-strip", "christmas-lights"].includes(icon)) return YDevice.light_strip;
	if (icon.startsWith("light-hanging")) return YDevice.light_ceiling;
	if (icon.startsWith("light-")) return YDevice.light;

	switch (icon) {
		// coverings
		case "window": return YDevice.openable;
		case "window2": return YDevice.openable;
		case "window3": return YDevice.openable;
		case "blinds": return YDevice.openable_curtain;
		case "sunshade": return YDevice.openable_curtain;
		case "sunshade2": return YDevice.openable_curtain;
		case "curtains": return YDevice.openable_curtain;
		case "door": return YDevice.openable;
		case "garage-door": return YDevice.openable;

		// security
		case "camera": return YDevice.camera;
		case "smoke-detector": return YDevice.sensor_smoke;
		case "motion-sensor": return YDevice.sensor_motion;
		case "door-window-sensor": return YDevice.sensor_open;

		// appliances
		case "coffee-machine": return YDevice.cooking_coffee_maker;
		case "coffee-machine2": return YDevice.cooking_coffee_maker;
		case "kettle": return YDevice.cooking_kettle;
		case "airfryer": return YDevice.cooking;
		case "microwave": return YDevice.cooking;
		case "blender": return YDevice.cooking;
		case "toaster": return YDevice.cooking;
		case "cooking-plate": return YDevice.cooking;
		case "extractor-hood": return YDevice.ventilation_fan;
		case "oven": return YDevice.cooking;
		case "fridge": return YDevice.cooking;
		case "vacuum-cleaner": return YDevice.vacuum_cleaner;

		// climate
		case "climate": return YDevice.thermostat_ac;
		case "climate2": return YDevice.thermostat_ac;
		case "climate3": return YDevice.thermostat_ac;
		case "fan": return YDevice.ventilation_fan;
		case "fan2": return YDevice.ventilation_fan;
		case "thermostat": return YDevice.thermostat;
		case "heating": return YDevice.thermostat;
		case "cv": return YDevice.thermostat;
		case "ventilation": return YDevice.ventilation_fan;

		// switching
		case "switch-single": return YDevice.switch;
		case "switch-double": return YDevice.switch;
		case "plug": return YDevice.socket;
		case "plug2": return YDevice.socket;
		case "socket": return YDevice.socket;

		// audio
		// multimedia

		// household
		case "smart-meter2": return YDevice.smart_meter;
		case "smart-meter3": return YDevice.smart_meter;

		// various
	}
}
