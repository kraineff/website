import { Converter } from "../converter";
import { YEvent, YInstance, YMode, YUnit } from "../types/yandex";

export const StateConverter = <Name extends string>(name: Name, invert = false) => {
	const converter = () => Converter
		.create(name)
		.createState(run => run
			.getCapability<boolean>(name, value => invert ? !value : value)
			.setCapability<boolean>(name, value => invert ? !value : value)
		);
    return { [name]: converter } as Record<Name, () => Converter>;
};

export const ToggleConverter = <Name extends string>(name: Name, instance: YInstance) => {
	const converter = () => Converter
		.create(name)
		.createToggle(instance, run => run
			.getCapability<boolean>(name)
			.setCapability<boolean>(name)
		);
    return { [name]: converter } as Record<Name, () => Converter>;
};

export const FloatConverter = <Name extends string>(name: Name, instance: YInstance, unit?: YUnit) => {
    const converter = () => Converter
        .create(name)
        .createFloat(instance, run => run
            .setParameters({ unit })
            .getCapability<number>(name)
        );
    return { [name]: converter } as Record<Name, () => Converter>;
};

export const EventConverter = <Name extends string>(name: Name, instance: YInstance, falseEvent: YEvent | undefined, trueEvent: YEvent | undefined) => {
	const valueToEvent = [falseEvent, trueEvent];
    const events = valueToEvent.filter(event => event !== undefined);
    const converter = () => Converter
        .create(name)
        .createEvent(instance, run => run
            .setParameters({ events })
            .getCapability<boolean>(name, value => valueToEvent[+value])
        );
    return { [name]: converter } as Record<Name, () => Converter>;
};

export const RangePercentConverter = <Name extends string>(name: Name, instance: YInstance) => {
    const converter = () => Converter
        .create(name)
        .createRange(instance, run => run
            .setParameters({
                unit: YUnit.percent,
                range: { min: 0, max: 100, precision: 1 },
            })
            .getCapability<number>(name, value => value * 100)
            .setCapability<number>(name, value => value / 100)
        );
    return { [name]: converter } as Record<Name, () => Converter>;
};

const LightHSVConverter = <Name extends string>(name: Name) => {
    const converter = () => Converter
        .create(name)
        .createColor(YInstance.hsv, run => run
            .getCapabilities<{
                light_hue: number,
                light_saturation: number,
                light_mode: string,
            }>(({ light_hue, light_saturation, light_mode }) => {
                if (light_mode !== "color") {
                    return undefined;
                }
                return {
                    h: Math.round((light_hue ?? 1) * 360),
                    s: Math.round((light_saturation ?? 1) * 100),
                    v: 100,
                };
            })
            .setCapabilities<{
                light_hue: number,
                light_saturation: number,
                light_mode: string,
            }>(value => ({
                light_hue: value.h / 360,
                light_saturation: value.s / 100,
                light_mode: "color",
            }))
        );
    return { [name]: converter } as Record<Name, () => Converter>;
};

const LightTemperatureConverter = () => {
    const converter = () => Converter
        .create("light_temperature")
        .createColor(YInstance.temperature_k, run => run
            .setParameters({ temperature_k: { min: 1500, max: 9000 } })
            .getCapabilities<{
                light_temperature: number,
                light_mode: string,
            }>(({ light_temperature, light_mode }) => {
                if (light_mode !== "temperature" || light_temperature === undefined) {
                    return undefined;
                }
                return Math.round(((((1 - light_temperature) - 0) * (9000 - 1500)) / (1 - 0)) + 1500);
            })
            .setCapabilities<{
                light_temperature: number,
                light_mode: string,
            }>(value => ({
                light_temperature: 1 - ((((value - 1500) * (1 - 0)) / (9000 - 1500)) + 0),
                light_mode: "temperature",
            }))
        );
    return { light_temperature: converter };
};

export const CapabilityConverters = {
    ...EventConverter("alarm_battery", YInstance.battery_level, YEvent.normal, YEvent.low),
    ...EventConverter("alarm_co", YInstance.gas, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_co2", YInstance.gas, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_contact", YInstance.open, YEvent.closed, YEvent.opened),
    ...EventConverter("alarm_gas", YInstance.gas, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_motion", YInstance.motion, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_presence", YInstance.motion, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_smoke", YInstance.smoke, YEvent.not_detected, YEvent.detected),
    ...EventConverter("alarm_tamper", YInstance.open, YEvent.closed, YEvent.opened),
    ...EventConverter("alarm_tank_open", YInstance.open, YEvent.closed, YEvent.opened),
    ...EventConverter("alarm_vibration", YInstance.vibration, undefined, YEvent.vibration),
    ...EventConverter("alarm_water", YInstance.water_leak, YEvent.dry, YEvent.leak),
    
    "button": () => Converter
        .create("button")
        .createState(run => run
            .setParameters({ split: true, retrievable: false })
            .getCapability<boolean>("button", () => false)
            .setCapability<boolean>("button", value => [undefined, true][+value])
        ),
    
    "channel_up": () => Converter
        .create("channel_up")
        .createRange(YInstance.channel, run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapabilities<Record<string, boolean>>(value => ({ ["channel_" + ["down", "up"][value]]: true }))
        ),
    
    ...ToggleConverter("child_lock", YInstance.controls_locked),
    ...RangePercentConverter("dim", YInstance.brightness),
    ...StateConverter("garagedoor_closed", true),
    ...LightHSVConverter("light_hue"),
    ...LightHSVConverter("light_saturation"),
    ...LightTemperatureConverter(),
    ...StateConverter("locked", true),
    ...FloatConverter("measure_battery", YInstance.battery_level, YUnit.percent),
    ...FloatConverter("measure_co", YInstance.co2_level, YUnit.ppm),
    ...FloatConverter("measure_co2", YInstance.co2_level, YUnit.ppm),
    ...FloatConverter("measure_current", YInstance.amperage, YUnit.ampere),
    ...FloatConverter("measure_humidity", YInstance.humidity, YUnit.percent),
    ...FloatConverter("measure_luminance", YInstance.illumination, YUnit.illumination_lux),
    ...FloatConverter("measure_pm1", YInstance.pm1_density, YUnit.density_mcg_m3),
    ...FloatConverter("measure_pm10", YInstance.pm10_density, YUnit.density_mcg_m3),
    ...FloatConverter("measure_pm25", YInstance.pm2_5_density, YUnit.density_mcg_m3),
    ...FloatConverter("measure_power", YInstance.power, YUnit.watt),
    ...FloatConverter("measure_pressure", YInstance.pressure, YUnit.pressure_bar),
    ...FloatConverter("measure_temperature", YInstance.temperature, YUnit.temperature_celsius),
    ...FloatConverter("measure_tvoc", YInstance.tvoc, YUnit.density_mcg_m3),
    ...FloatConverter("measure_voltage", YInstance.voltage, YUnit.volt),
    ...FloatConverter("meter_gas", YInstance.gas_meter, YUnit.cubic_meter),
    ...FloatConverter("meter_power", YInstance.electricity_meter, YUnit.kilowatt_hour),
    ...FloatConverter("meter_water", YInstance.water_meter, YUnit.cubic_meter),
    ...StateConverter("onoff"),
    ...ToggleConverter("oscillating", YInstance.oscillation),
    ...StateConverter("speaker_playing"),
    
    "swing_mode": () => Converter
        .create("swing_mode")
        .createMode(YInstance.cleanup_mode, run => run
            .setParameters({ modes: [YMode.vertical, YMode.horizontal, YMode.auto] })
            .getCapability<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) ? value : value === "both" ? "auto" : undefined)
            .setCapability<string>("swing_mode", value => value === "auto" ? "both" : value)
        ),
    
    "target_temperature": () => Converter
        .create("target_temperature")
        .createRange(YInstance.temperature, run => run
            .setParameters({
                unit: YUnit.temperature_celsius,
                parse: ({ target_temperature }) => ({
                    range: {
                        min: target_temperature.min ?? 4,
                        max: target_temperature.max ?? 35,
                        precision: target_temperature.step ?? 0.5
                    }
                }),
            })
            .getCapability<number>("target_temperature")
            .setCapability<number>("target_temperature")
        ),
    
    "thermostat_mode": () => Converter
        .create("thermostat_mode")
        .createState(run => run
            .getCapability<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
            .setCapability<string>("thermostat_mode", value => ["off", "heat"][+value])
        )
        .createMode(YInstance.thermostat, run => run
            .setParameters({ modes: [YMode.auto, YMode.heat, YMode.cool] })
            .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) ? value : undefined)
            .setCapability<string>("thermostat_mode")
        ),
    
    "vacuumcleaner_job_mode": () => Converter
        .create("vacuumcleaner_job_mode")
        .createMode(YInstance.cleanup_mode, run => run
            .setParameters({ modes: [YMode.normal, YMode.high, YMode.turbo, YMode.wet_cleaning, YMode.auto] })
            .getCapability<string>("vacuumcleaner_job_mode", value => ["normal", "high", "turbo", "auto"].includes(value) ? value : value === "mop" ? "wet_cleaning" : undefined)
            .setCapability<string>("vacuumcleaner_job_mode", value => value === "wet_cleaning" ? "mop" : value)
        ),
    
    ...RangePercentConverter("valve_position", YInstance.open),
    ...ToggleConverter("volume_mute", YInstance.mute),
    ...RangePercentConverter("volume_set", YInstance.volume),
    
    "volume_up": () => Converter
        .create("volume_up")
        .createRange(YInstance.volume, run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapabilities<Record<string, boolean>>(value => ({ ["volume_" + ["down", "up"][value]]: true }))
        ),
    
    ...StateConverter("windowcoverings_closed", true),
    ...RangePercentConverter("windowcoverings_set", YInstance.open),
};