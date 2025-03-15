import { Converter } from "../converter";
import { DeviceType } from "../types";

export const DeviceConverters = {
    "codes.lucasvdh.android-tv:remote": () => Converter
        .create("codes.lucasvdh.android-tv:remote")
        .createRange("channel", run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapability<boolean>("key_channel_up", value => value === 1 && true || "@break")
            .setCapability<boolean>("key_channel_down", value => value === 0 && true || "@break"))
        .createToggle("pause", run => run
            .setParameters({ retrievable: false })
            .setCapability<boolean>("key_pause", value => value === true && true || "@break")
            .setCapability<boolean>("key_play", value => value === false && true || "@break")),
    
    "com.aqara:aqara.feeder.acn001": () => Converter
        .create("com.aqara:aqara.feeder.acn001")
        .createState(run => run
            .setParameters({ split: true, retrievable: false })
            .getCapability<boolean>("feeder_action", () => false)
            .setCapability<boolean>("feeder_action", value => value === true && value || "@break"))
        .createToggle("controls_locked", run => run
            .getSetting<boolean>("control_lock")),
    
    "com.fibaro:FGR-223": () => Converter
        .create("com.fibaro:FGR-223")
        .createRange("open", run => run
            .setParameters({
                unit: "percent",
                range: { min: 0, max: 100, precision: 1 }
            })
            .getCapability<number>("windowcoverings_set", value => value * 100)
            .getCapability<number>("dim", value => value * 100)
            .setCapability<number>("windowcoverings_set", value => value / 100)
            .setCapability<number>("dim", value => value / 100)),
    
    "com.irobot:roomba_vacuum": () => Converter
        .create("com.irobot:roomba_vacuum")
        .createState(run => run
            .getCapability<string>("vacuum_state", value => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(value))
            .setCapability<boolean>("command_start_clean", value => value === true && true || "@break")
            .setCapability<boolean>("command_dock", value => value === false && true || "@break"))
        .createToggle("pause", run => run
            .getCapability<string>("vacuum_state", value => ["paused", "stopped"].includes(value))
            .setCapability<boolean>("command_pause", value => value === true && true || "@break")
            .setCapability<boolean>("command_resume", value => value === false && true || "@break"))
        .createFloat("meter", run => run
            .getCapability<number>("measure_mission_minutes"))
        .createEvent("open", run => run
            .setParameters({ events: ["opened", "closed"] })
            .getCapability<boolean>("alarm_bin_removed", value => ["closed", "opened"][Number(value)])),
    
    "com.nokia.health:user": () => Converter
        .create("com.nokia.health:user", DeviceType.Meter)
        .createFloat("temperature", run => run
            .setParameters({ unit: "temperature.celsius" })
            .getCapability<number>("nh_measure_body_temperature"))
        .createFloat("pressure", run => run
            .setParameters({ unit: "pressure.mmhg" })
            .getCapability<number>("nh_measure_systolic_blood_pressure"))
        .createFloat("food_level", run => run
            .setParameters({ unit: "percent" })
            .getCapability<number>("nh_measure_fat_ratio"))
        .createFloat("meter", run => run
            .getCapability<number>("nh_measure_weight")),
    
    "com.sensibo:Sensibo": () => Converter
        .create("com.sensibo:Sensibo")
        .createState(run => run
            .getCapability<boolean>("se_onoff")
            .setCapability<boolean>("se_onoff"))
        .createMode("thermostat", run => run
            .setParameters({ modes: ["auto", "heat", "cool"] })
            .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
            .setCapability<string>("thermostat_mode"))
        .createMode("fan_speed", run => run
            .setParameters({ modes: ["quiet", "auto", "low", "medium", "high"] })
            .getCapability<string>("se_fanlevel", value => ["quiet", "auto", "low", "medium", "high"].includes(value) && value || "@break")
            .setCapability<string>("se_fanlevel")),
    
    "com.xiaomi-mi:airrtc.agl001": () => Converter
        .create("com.xiaomi-mi:airrtc.agl001")
        .createState(run => run
            .getCapability<string>("thermostat_mode_AqaraTRV", value => ({ "off": false, "manual": true })[value] ?? "@break")
            .setCapability<string>("thermostat_mode_AqaraTRV", value => ["off", "manual"][Number(value)]))
        .createMode("thermostat", run => run
            .setParameters({ modes: ["auto"] })
            .getCapability<string>("thermostat_mode_AqaraTRV", value => value === "away" && "auto" || "@break")
            .setCapability<string>("thermostat_mode_AqaraTRV", value => value === "auto" && "away" || "@break"))
        .createEvent("open", run => run
            .setParameters({ events: ["closed", "opened"] })
            .getCapability<boolean>("alarm_window", value => ["closed", "opened"][Number(value)])),
    
    "net.schmidt-cisternas.pcc-alt:aircon": () => Converter
        .create("net.schmidt-cisternas.pcc-alt:aircon")
        .createMode("fan_speed", run => run
            .setParameters({ modes: ["auto", "low", "medium", "high"] })
            .getCapability<string>("fan_speed", value => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" } as any)[value]) ?? "@break")
            .setCapability<string>("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value])!))
        .createMode("program", run => run
            .setParameters({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
            .getCapability<string>("operation_mode", value => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" } as any)[value]) ?? "@break")
            .setCapability<string>("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value])!))
};