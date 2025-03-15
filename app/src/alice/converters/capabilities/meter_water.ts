import { Converter } from "../../converter";

export default () => Converter
    .create("meter_water")
    .createFloat("water_meter", run => run
        .setParameters({ unit: "cubic_meter" })
        .getCapability<number>("meter_water"));