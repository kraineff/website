import { Converter } from "../../converter";

export default () => Converter
    .create("garagedoor_closed")
    .createState(run => run
        .getCapability<boolean>("garagedoor_closed", value => !value)
        .setCapability<boolean>("garagedoor_closed", value => !value));