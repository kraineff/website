import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_battery")
    .createEvent("battery_level", run => run
        .setParameters({ events: ["normal", "low"] })
        .getCapability<boolean>("alarm_battery", value => ["normal", "low"][Number(value)]));