import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_vibration")
    .createEvent("vibration", run => run
        .setParameters({ events: ["vibration"] })
        .getCapability<boolean>("alarm_vibration", value => value && "vibration" || "@break"));