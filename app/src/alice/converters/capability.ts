import { Converter } from "../converter";

export const CapabilityConverters = {
    "alarm_battery": () => Converter
        .create("alarm_battery")
        .createEvent("battery_level", run => run
            .setParameters({ events: ["normal", "low"] })
            .getCapability<boolean>("alarm_battery", value => ["normal", "low"][Number(value)])),
    
    "alarm_co": () => Converter
        .create("alarm_co")
        .createEvent("gas", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_co", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_co2": () => Converter
        .create("alarm_co2")
        .createEvent("gas", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_co2", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_contact": () => Converter
        .create("alarm_contact")
        .createEvent("open", run => run
            .setParameters({ events: ["closed", "opened"] })
            .getCapability<boolean>("alarm_contact", value => ["closed", "opened"][Number(value)])),
    
    "alarm_gas": () => Converter
        .create("alarm_gas")
        .createEvent("gas", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_motion": () => Converter
        .create("alarm_motion")
        .createEvent("motion", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_presence": () => Converter
        .create("alarm_presence")
        .createEvent("motion", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_smoke": () => Converter
        .create("alarm_smoke")
        .createEvent("smoke", run => run
            .setParameters({ events: ["not_detected", "detected"] })
            .getCapability<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)])),
    
    "alarm_tamper": () => Converter
        .create("alarm_tamper")
        .createEvent("open", run => run
            .setParameters({ events: ["closed", "opened"] })
            .getCapability<boolean>("alarm_tamper", value => ["closed", "opened"][Number(value)])),
    
    "alarm_tank_open": () => Converter
        .create("alarm_tank_open")
        .createEvent("open", run => run
            .setParameters({ events: ["closed", "opened"] })
            .getCapability<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)])),
    
    "alarm_vibration": () => Converter
        .create("alarm_vibration")
        .createEvent("vibration", run => run
            .setParameters({ events: ["vibration"] })
            .getCapability<boolean>("alarm_vibration", value => value && "vibration" || "@break")),
    
    "alarm_water": () => Converter
        .create("alarm_water")
        .createEvent("water_leak", run => run
            .setParameters({ events: ["dry", "leak"] })
            .getCapability<boolean>("alarm_water", value => ["dry", "leak"][Number(value)])),
    
    "button": () => Converter
        .create("button")
        .createState(run => run
            .setParameters({ split: true, retrievable: false })
            .getCapability<boolean>("button", () => false)
            .setCapability<boolean>("button", value => value === true && value || "@break")),
    
    "channel_up": () => Converter
        .create("channel_up")
        .createRange("channel", run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapability<boolean>("channel_up", value => value === 1 && true || "@break")
            .setCapability<boolean>("channel_down", value => value === 0 && true || "@break")),
    
    "child_lock": () => Converter
        .create("child_lock")
        .createToggle("controls_locked", run => run
            .getCapability<boolean>("child_lock")
            .setCapability<boolean>("child_lock")),
    
    "dim": () => Converter
        .create("dim")
        .createRange("brightness", run => run
            .setParameters({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 },
            })
            .getCapability<number>("dim", value => value * 100)
            .setCapability<number>("dim", value => value / 100)),
    
    "garagedoor_closed": () => Converter
        .create("garagedoor_closed")
        .createState(run => run
            .getCapability<boolean>("garagedoor_closed", value => !value)
            .setCapability<boolean>("garagedoor_closed", value => !value)),
    
    "light_hue": () => Converter
        .create("light_hue")
        .createColor("hsv", run => run
            .getCapability<number>("light_hue", value => ({ h: Math.round(value * 360), s: 100, v: 100 }))
            .getCapability<number>("light_saturation", value => ({ s: Math.round(value * 100), v: 100 }))
            .getCapability<string>("light_mode", value => value === "color" && "@prev" || "@break")
            .setCapability<number>("light_hue", value => value.h / 360)
            .setCapability<number>("light_saturation", value => value.s / 100)
            .setCapability<string>("light_mode", () => "color")),
    
    "light_temperature": () => Converter
        .create("light_temperature")
        .createColor("temperature_k", run => run
            .setParameters({ temperature_k: { min: 1500, max: 9000 } })
            .getCapability<number>("light_temperature", value => Math.round(((((1 - value) - 0) * (9000 - 1500)) / (1 - 0)) + 1500))
            .getCapability<string>("light_mode", value => value === "temperature" && "@prev" || "@break")
            .setCapability<number>("light_temperature", value => 1 - ((((value - 1500) * (1 - 0)) / (9000 - 1500)) + 0))
            .setCapability<string>("light_mode", () => "temperature")),
    
    "locked": () => Converter
        .create("locked")
        .createState(run => run
            .getCapability<boolean>("locked", value => !value)
            .setCapability<boolean>("locked", value => !value)),
    
    "measure_battery": () => Converter
        .create("measure_battery")
        .createFloat("battery_level", run => run
            .setParameters({ unit: "percent" })
            .getCapability<number>("measure_battery")),
    
    "measure_co": () => Converter
        .create("measure_co")
        .createFloat("co2_level", run => run
            .setParameters({ unit: "ppm" })
            .getCapability<number>("measure_co")),
    
    "measure_co2": () => Converter
        .create("measure_co2")
        .createFloat("co2_level", run => run
            .setParameters({ unit: "ppm" })
            .getCapability<number>("measure_co2")),
    
    "measure_current": () => Converter
        .create("measure_current")
        .createFloat("amperage", run => run
            .setParameters({ unit: "ampere" })
            .getCapability<number>("measure_current")),
    
    "measure_humidity": () => Converter
        .create("measure_humidity")
        .createFloat("humidity", run => run
            .setParameters({ unit: "percent" })
            .getCapability<number>("measure_humidity")),
    
    "measure_luminance": () => Converter
        .create("measure_luminance")
        .createFloat("illumination", run => run
            .setParameters({ unit: "illumination.lux" })
            .getCapability<number>("measure_luminance")),
    
    "measure_pm1": () => Converter
        .create("measure_pm1")
        .createFloat("pm1_density", run => run
            .setParameters({ unit: "density.mcg_m3" })
            .getCapability<number>("measure_pm1")),
    
    "measure_pm10": () => Converter
        .create("measure_pm10")
        .createFloat("pm10_density", run => run
            .setParameters({ unit: "density.mcg_m3" })
            .getCapability<number>("measure_pm10")),
    
    "measure_pm25": () => Converter
        .create("measure_pm25")
        .createFloat("pm2.5_density", run => run
            .setParameters({ unit: "density.mcg_m3" })
            .getCapability<number>("measure_pm25")),
    
    "measure_power": () => Converter
        .create("measure_power")
        .createFloat("power", run => run
            .setParameters({ unit: "watt" })
            .getCapability<number>("measure_power")),
    
    "measure_pressure": () => Converter
        .create("measure_pressure")
        .createFloat("pressure", run => run
            .setParameters({ unit: "pressure.bar" })
            .getCapability<number>("measure_pressure", value => value / 1000)),
    
    "measure_temperature": () => Converter
        .create("measure_temperature")
        .createFloat("temperature", run => run
            .setParameters({ unit: "temperature.celsius" })
            .getCapability<number>("measure_temperature")),
    
    "measure_tvoc": () => Converter
        .create("measure_tvoc")
        .createFloat("tvoc", run => run
            .setParameters({ unit: "density.mcg_m3" })
            .getCapability<number>("measure_tvoc")),
    
    "measure_voltage": () => Converter
        .create("measure_voltage")
        .createFloat("voltage", run => run
            .setParameters({ unit: "volt" })
            .getCapability<number>("measure_voltage")),
    
    "meter_gas": () => Converter
        .create("meter_gas")
        .createFloat("gas_meter", run => run
            .setParameters({ unit: "cubic_meter" })
            .getCapability<number>("meter_gas")),
    
    "meter_power": () => Converter
        .create("meter_power")
        .createFloat("electricity_meter", run => run
            .setParameters({ unit: "kilowatt_hour" })
            .getCapability<number>("meter_power")),
    
    "meter_water": () => Converter
        .create("meter_water")
        .createFloat("water_meter", run => run
            .setParameters({ unit: "cubic_meter" })
            .getCapability<number>("meter_water")),
    
    "onoff": () => Converter
        .create("onoff")
        .createState(run => run
            .getCapability<boolean>("onoff")
            .setCapability<boolean>("onoff")),
    
    "oscillating": () => Converter
        .create("oscillating")
        .createToggle("oscillation", run => run
            .getCapability<boolean>("oscillating")
            .setCapability<boolean>("oscillating")),
    
    "speaker_playing": () => Converter
        .create("speaker_playing")
        .createState(run => run
            .getCapability<boolean>("speaker_playing")
            .setCapability<boolean>("speaker_playing")),
    
    "swing_mode": () => Converter
        .create("swing_mode")
        .createMode("cleanup_mode", run => run
            .setParameters({ modes: ["vertical", "horizontal", "auto"] })
            .getCapability<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) && value || value === "both" && "auto" || "@break")
            .setCapability<string>("swing_mode", value => value === "auto" && "both" || value)),
    
    "target_temperature": () => Converter
        .create("target_temperature")
        .createRange("temperature", run => run
            .setParameters({
                unit: "temperature.celsius",
                parse: ({ target_temperature }) => ({
                    range: {
                        min: target_temperature.min ?? 4,
                        max: target_temperature.max ?? 35,
                        precision: target_temperature.step ?? 0.5
                    }
                }),
            })
            .getCapability<number>("target_temperature")
            .setCapability<number>("target_temperature")),
    
    "thermostat_mode": () => Converter
        .create("thermostat_mode")
        .createState(run => run
            .getCapability<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
            .setCapability<string>("thermostat_mode", value => ["off", "heat"][Number(value)]))
        .createMode("thermostat", run => run
            .setParameters({ modes: ["auto", "heat", "cool"] })
            .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
            .setCapability<string>("thermostat_mode")),
    
    "vacuumcleaner_job_mode": () => Converter
        .create("vacuumcleaner_job_mode")
        .createMode("cleanup_mode", run => run
            .setParameters({ modes: ["normal", "high", "turbo", "wet_cleaning", "auto"] })
            .getCapability<string>("vacuumcleaner_job_mode", value => ["normal", "high", "turbo", "auto"].includes(value) && value || value === "mop" && "wet_cleaning" || "@break")
            .setCapability<string>("vacuumcleaner_job_mode", value => value === "wet_cleaning" && "mop" || value)),
    
    "valve_position": () => Converter
        .create("valve_position")
        .createRange("open", run => run
            .setParameters({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getCapability<number>("valve_position", value => value * 100)
            .setCapability<number>("valve_position", value => value / 100)),
    
    "volume_mute": () => Converter
        .create("volume_mute")
        .createToggle("mute", run => run
            .getCapability<boolean>("volume_mute")
            .setCapability<boolean>("volume_mute")),
    
    "volume_set": () => Converter
        .create("volume_set")
        .createRange("volume", run => run
            .setParameters({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getCapability<number>("volume_set", value => value * 100)
            .setCapability<number>("volume_set", value => value / 100)),
    
    "volume_up": () => Converter
        .create("volume_up")
        .createRange("volume", run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapability<boolean>("volume_up", value => value === 1 && true || "@break")
            .setCapability<boolean>("volume_down", value => value === 0 && true || "@break")),
    
    "windowcoverings_closed": () => Converter
        .create("windowcoverings_closed")
        .createState(run => run
            .getCapability<boolean>("windowcoverings_closed", value => !value)
            .setCapability<boolean>("windowcoverings_closed", value => !value)),
    
    "windowcoverings_set": () => Converter
        .create("windowcoverings_set")
        .createRange("open", run => run
            .setParameters({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getCapability<number>("windowcoverings_set", value => value * 100)
            .setCapability<number>("windowcoverings_set", value => value / 100))
};