import { Converter } from "../../converter";

export default () => Converter
    .create("measure_pm10")
    .createFloat("pm10_density", run => run
        .setParameters({ unit: "density.mcg_m3" })
        .getCapability<number>("measure_pm10"));