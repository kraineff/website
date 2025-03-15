import { Converter } from "../../converter";

export default () => Converter
    .create("measure_pm1")
    .createFloat("pm1_density", run => run
        .setParameters({ unit: "density.mcg_m3" })
        .getCapability<number>("measure_pm1"));