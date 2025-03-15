import { Converter } from "../../converter";

export default () => Converter
    .create("locked")
    .createState(run => run
        .getCapability<boolean>("locked", value => !value)
        .setCapability<boolean>("locked", value => !value));