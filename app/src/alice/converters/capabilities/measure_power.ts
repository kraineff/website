import { Converter } from "../../converter";

export default () => Converter
    .create("measure_power")
    .createFloat("power", run => run
        .setParameters({ unit: "watt" })
        .getCapability<number>("measure_power"));