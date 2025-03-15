import { Converter } from "../../converter";

export default () => Converter
    .create("measure_pressure")
    .createFloat("pressure", run => run
        .setParameters({ unit: "pressure.bar" })
        .getCapability<number>("measure_pressure", value => value / 1000));