import { Converter } from "../../converter";

export default () => Converter
    .create("measure_temperature")
    .createFloat("temperature", run => run
        .setParameters({ unit: "temperature.celsius" })
        .getCapability<number>("measure_temperature"));