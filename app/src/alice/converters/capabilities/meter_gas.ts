import { Converter } from "../../converter";

export default () => Converter
    .create("meter_gas")
    .createFloat("gas_meter", run => run
        .setParameters({ unit: "cubic_meter" })
        .getCapability<number>("meter_gas"));