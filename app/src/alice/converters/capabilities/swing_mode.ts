import { Converter } from "../../converter";

export default () => Converter
    .create("swing_mode")
    .createMode("cleanup_mode", run => run
        .setParameters({ modes: ["vertical", "horizontal", "auto"] })
        .getCapability<string>("swing_mode", value => ["vertical", "horizontal"].includes(value) && value || value === "both" && "auto" || "@break")
        .setCapability<string>("swing_mode", value => value === "auto" && "both" || value));