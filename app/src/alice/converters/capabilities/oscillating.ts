import { Converter } from "../../converter";

export default () => Converter
    .create("oscillating")
    .createToggle("oscillation", run => run
        .getCapability<boolean>("oscillating")
        .setCapability<boolean>("oscillating"));