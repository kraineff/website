import { Converter } from "../../converter";

export default () => Converter
    .create("measure_humidity")
    .createFloat("humidity", run => run
        .setParameters({ unit: "percent" })
        .getCapability<number>("measure_humidity"));