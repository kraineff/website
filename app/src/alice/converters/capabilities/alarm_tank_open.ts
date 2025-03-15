import { Converter } from "../../converter";

export default () => Converter
    .create("alarm_tank_open")
    .createEvent("open", run => run
        .setParameters({ events: ["closed", "opened"] })
        .getCapability<boolean>("alarm_tank_open", value => ["closed", "opened"][Number(value)]));