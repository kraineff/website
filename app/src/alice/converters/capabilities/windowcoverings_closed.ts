import { Converter } from "../../converter";

export default () => Converter
    .create("windowcoverings_closed")
    .createState(run => run
        .getCapability<boolean>("windowcoverings_closed", value => !value)
        .setCapability<boolean>("windowcoverings_closed", value => !value));