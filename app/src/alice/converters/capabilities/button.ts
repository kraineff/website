import { Converter } from "../../converter";

export default () => Converter
    .create("button")
    .createState(run => run
        .setParameters({ split: true, retrievable: false })
        .getCapability<boolean>("button", () => false)
        .setCapability<boolean>("button", value => value === true && value || "@break"));