import { Converter } from "../../converter";

export default () => Converter
    .create("measure_co")
    .createFloat("co2_level", run => run
        .setParameters({ unit: "ppm" })
        .getCapability<number>("measure_co"));