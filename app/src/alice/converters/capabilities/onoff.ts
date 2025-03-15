import { Converter } from "../../converter";

export default () => Converter
    .create("onoff")
    .createState(run => run
        .getCapability<boolean>("onoff")
        .setCapability<boolean>("onoff"));