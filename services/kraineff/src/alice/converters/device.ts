import { YandexDevice } from "../types/yandex";
import { Converter } from "../converter";

export const DeviceConverters = {
    "codes.lucasvdh.android-tv:remote": () => Converter
        .create("codes.lucasvdh.android-tv:remote")
        .createRange("channel", run => run
            .setParameters({ retrievable: false, random_access: false, range: { min: 0, max: 1, precision: 1 } })
            .setCapabilities<Record<string, boolean>>(value => ({ ["key_channel_" + ["down", "up"][value]]: true }))
        )
        .createToggle("pause", run => run
            .setParameters({ retrievable: false })
            .setCapabilities<Record<string, boolean>>(value => ({ ["key_" + ["play", "pause"][+value]]: true }))
        ),
    
    "com.aqara:aqara.feeder.acn001": () => Converter
        .create("com.aqara:aqara.feeder.acn001")
        .createState(run => run
            .setParameters({ split: true, retrievable: false })
            .getCapability<boolean>("feeder_action", () => false)
            .setCapability<boolean>("feeder_action", value => [undefined, true][+value])
        ),
        // .createToggle("controls_locked", run => run
            // .getSetting<boolean>("control_lock")),
    
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
            .setCapability<number>("dim", value => value / 100)
        ),
    
    "com.irobot:roomba_vacuum": () => Converter
        .create("com.irobot:roomba_vacuum")
        .createState(run => run
            .getCapability<string>("vacuum_state", value => ["clean", "quick", "spot", "train", "manual", "paused", "stopped"].includes(value))
            .setCapabilities<Record<string, boolean>>(value => ({ ["command_" + ["dock", "start_clean"][+value]]: true }))
        )
        .createToggle("pause", run => run
            .getCapability<string>("vacuum_state", value => ["paused", "stopped"].includes(value))
            .setCapabilities<Record<string, boolean>>(value => ({ ["command_" + ["resume", "pause"][+value]]: true }))
        )
        .createFloat("meter", run => run
            .getCapability<number>("measure_mission_minutes")
        )
        .createEvent("open", run => run
            .setParameters({ events: ["opened", "closed"] })
            .getCapability<boolean>("alarm_bin_removed", value => ["closed", "opened"][+value])
        ),
    
    "com.nokia.health:user": () => Converter
        .create("com.nokia.health:user", YandexDevice.Meter)
        .createFloat("temperature", run => run
            .setParameters({ unit: "temperature.celsius" })
            .getCapability<number>("nh_measure_body_temperature")
        )
        .createFloat("pressure", run => run
            .setParameters({ unit: "pressure.mmhg" })
            .getCapability<number>("nh_measure_systolic_blood_pressure")
        )
        .createFloat("food_level", run => run
            .setParameters({ unit: "percent" })
            .getCapability<number>("nh_measure_fat_ratio")
        )
        .createFloat("meter", run => run
            .getCapability<number>("nh_measure_weight")
        ),
    
    "com.sensibo:Sensibo": () => Converter
        .create("com.sensibo:Sensibo")
        .createState(run => run
            .getCapability<boolean>("se_onoff")
            .setCapability<boolean>("se_onoff")
        )
        .createMode("thermostat", run => run
            .setParameters({ modes: ["auto", "heat", "cool"] })
            .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) ? value : undefined)
            .setCapability<string>("thermostat_mode")
        )
        .createMode("fan_speed", run => run
            .setParameters({ modes: ["quiet", "auto", "low", "medium", "high"] })
            .getCapability<string>("se_fanlevel", value => ["quiet", "auto", "low", "medium", "high"].includes(value) ? value : undefined)
            .setCapability<string>("se_fanlevel")
        ),
    
    "com.xiaomi-mi:airrtc.agl001": () => Converter
        .create("com.xiaomi-mi:airrtc.agl001")
        .createState(run => run
            .getCapability<string>("thermostat_mode_AqaraTRV", value => ({ "off": false, "manual": true })[value])
            .setCapability<string>("thermostat_mode_AqaraTRV", value => ["off", "manual"][+value])
        )
        .createMode("thermostat", run => run
            .setParameters({ modes: ["auto"] })
            .getCapability<string>("thermostat_mode_AqaraTRV", value => value === "away" ? "auto" : undefined)
            .setCapability<string>("thermostat_mode_AqaraTRV", value => value === "auto" ? "away" : undefined)
        )
        .createEvent("open", run => run
            .setParameters({ events: ["closed", "opened"] })
            .getCapability<boolean>("alarm_window", value => ["closed", "opened"][+value])
        ),
    
    "net.schmidt-cisternas.pcc-alt:aircon": () => Converter
        .create("net.schmidt-cisternas.pcc-alt:aircon")
        .createMode("fan_speed", run => run
            .setParameters({ modes: ["auto", "low", "medium", "high"] })
            .getCapability<string>("fan_speed", value => (({ Auto: "auto", Low: "low", Mid: "medium", High: "high" })[value]))
            .setCapability<string>("fan_speed", value => ({ auto: "Auto", low: "Low", medium: "Mid", high: "High" }[value]))
        )
        .createMode("program", run => run
            .setParameters({ modes: ["auto", "dry", "cool", "heat", "fan_only"] })
            .getCapability<string>("operation_mode", value => (({ Auto: "auto", Dry: "dry", Cool: "cool", Heat: "heat", Fan: "fan_only" })[value]))
            .setCapability<string>("operation_mode", value => ({ auto: "Auto", dry: "Dry", cool: "Cool", heat: "Heat", fan_only: "Fan" }[value]))
        )
};