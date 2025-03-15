import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_smoke")
    .createEvent("smoke", run => run
        .setParameters({ events: ["not_detected", "detected"] })
        .getCapability<boolean>("alarm_smoke", value => ["not_detected", "detected"][Number(value)]));