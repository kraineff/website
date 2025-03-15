import { Converter } from "../../converter";

export default () => Converter
    .create("dim")
    .createRange("brightness", run => run
        .setParameters({
            unit: "percent",
            range: { min: 0, max: 100, precision: 1 },
        })
        .getCapability<number>("dim", value => value * 100)
        .setCapability<number>("dim", value => value / 100));