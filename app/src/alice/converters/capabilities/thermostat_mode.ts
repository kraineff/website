import { Converter } from "../../converter";

export default () => Converter
    .create("thermostat_mode")
    .createState(run => run
        .getCapability<string>("thermostat_mode", value => ["heat", "auto", "cool"].includes(value))
        .setCapability<string>("thermostat_mode", value => ["off", "heat"][Number(value)]))
    .createMode("thermostat", run => run
        .setParameters({ modes: ["auto", "heat", "cool"] })
        .getCapability<string>("thermostat_mode", value => ["auto", "heat", "cool"].includes(value) && value || "@break")
        .setCapability<string>("thermostat_mode"));