import { Converter } from "../../converter";

export default () => Converter
    .create("meter_power")
    .createFloat("electricity_meter", run => run
        .setParameters({ unit: "kilowatt_hour" })
        .getCapability<number>("meter_power"));