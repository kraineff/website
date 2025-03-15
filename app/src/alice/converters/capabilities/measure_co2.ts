import { Converter } from "../../converter";

export default () => Converter
    .create("measure_co2")
    .createFloat("co2_level", run => run
        .setParameters({ unit: "ppm" })
        .getCapability<number>("measure_co2"));