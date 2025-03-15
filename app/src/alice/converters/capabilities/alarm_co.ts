import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_co")
    .createEvent("gas", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_co", value => ["not_detected", "detected"][Number(value)]));