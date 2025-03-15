import { Converter } from "../../converter";

export default () => Converter
    .create("measure_luminance")
    .createFloat("illumination", run => run
        .setParameters({ unit: "illumination.lux" })
        .getCapability<number>("measure_luminance"));