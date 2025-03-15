import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_gas")
    .createEvent("gas", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_gas", value => ["not_detected", "detected"][Number(value)]));