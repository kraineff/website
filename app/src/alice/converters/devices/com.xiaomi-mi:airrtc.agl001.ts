import { Converter } from "../../converter";

export default () => Converter
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
        .getCapability<boolean>("alarm_window", value => ["closed", "opened"][Number(value)]));