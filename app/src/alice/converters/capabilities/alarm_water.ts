import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_water")
    .createEvent("water_leak", run => run
        .setParameters({ events: ["dry", "leak"] })
        .getCapability<boolean>("alarm_water", value => ["dry", "leak"][Number(value)]));