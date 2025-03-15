import { Converter } from "../../converter";

export default () => Converter
    .create("volume_mute")
    .createToggle("mute", run => run
        .getCapability<boolean>("volume_mute")
        .setCapability<boolean>("volume_mute"));