import { Converter } from "../../converter";

export default () => Converter
    .create("measure_battery")
    .createFloat("battery_level", run => run
        .setParameters({ unit: "percent" })
        .getCapability<number>("measure_battery"));