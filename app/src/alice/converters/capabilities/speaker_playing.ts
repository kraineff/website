import { Converter } from "../../converter";

export default () => Converter
    .create("speaker_playing")
    .createState(run => run
        .getCapability<boolean>("speaker_playing")
        .setCapability<boolean>("speaker_playing"));