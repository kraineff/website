import { Converter } from "../../converter";

export default () => Converter
    .create("measure_voltage")
    .createFloat("voltage", run => run
        .setParameters({ unit: "volt" })
        .getCapability<number>("measure_voltage"));