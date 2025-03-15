import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_tamper")
    .createEvent("open", run => run
        .setParameters({ events: ["closed", "opened"] })
        .getCapability<boolean>("alarm_tamper", value => ["closed", "opened"][Number(value)]));