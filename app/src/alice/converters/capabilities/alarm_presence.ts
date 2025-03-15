import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_presence")
    .createEvent("motion", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_presence", value => ["not_detected", "detected"][Number(value)]));