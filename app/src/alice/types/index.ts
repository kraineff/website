import { HomeyAPIV2 } from "homey-api";

export * from "./actionResult";
export * from "./capability";
export * from "./device";
export * from "./routes";
export * from "./callback";
export * from "./deviceType";

export type HomeyCapability = HomeyAPIV2.ManagerDevices.Capability & { value: any };
export type HomeyCapabilities = Record<string, HomeyCapability>;