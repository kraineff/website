import { Converter } from "../../converter";

export default () => Converter
    .create("vacuumcleaner_job_mode")
    .createMode("cleanup_mode", run => run
        .setParameters({ modes: ["normal", "high", "turbo", "wet_cleaning", "auto"] })
        .getCapability<string>("vacuumcleaner_job_mode", value => ["normal", "high", "turbo", "auto"].includes(value) && value || value === "mop" && "wet_cleaning" || "@break")
        .setCapability<string>("vacuumcleaner_job_mode", value => value === "wet_cleaning" && "mop" || value));