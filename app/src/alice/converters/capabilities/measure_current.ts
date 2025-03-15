import { Converter } from "../../converter";

export default () => Converter
    .create("measure_current")
    .createFloat("amperage", run => run
        .setParameters({ unit: "ampere" })
        .getCapability<number>("measure_current"));