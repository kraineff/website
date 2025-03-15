import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_motion")
    .createEvent("motion", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_motion", value => ["not_detected", "detected"][Number(value)]));