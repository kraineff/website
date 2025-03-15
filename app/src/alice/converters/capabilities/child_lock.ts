import { Converter } from "../../converter";

export default () => Converter
    .create("child_lock")
    .createToggle("controls_locked", run => run
        .getCapability<boolean>("child_lock")
        .setCapability<boolean>("child_lock"));