import { Converter } from "../../converter";

export default () => Converter
    .create("measure_tvoc")
    .createFloat("tvoc", run => run
        .setParameters({ unit: "density.mcg_m3" })
        .getCapability<number>("measure_tvoc"));