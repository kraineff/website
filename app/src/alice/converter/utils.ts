import { HomeyAPIV2 } from "homey-api";
import { YandexDevice } from "../types/yandex";

export function getDeviceType(device: HomeyAPIV2.ManagerDevices.Device) {
    const virtualClass = device.virtualClass;
    const icon = device.iconOverride;

    if (virtualClass) {
        return ((virtualClass === "light" && icon) && getDeviceTypeByIcon(icon))
            || getDeviceTypeByClass(virtualClass);
    }

    return (icon && getDeviceTypeByIcon(icon))
        || getDeviceTypeByClass(device.class);
}

function getDeviceTypeByClass(deviceClass: string) {
    switch (deviceClass) {
        case "amplifier"         : return YandexDevice.Media;
        case "blinds"            : return YandexDevice.OpenableCurtain;
        case "button"            : return YandexDevice.SensorButton;
        case "camera"            : return YandexDevice.Camera;
        case "coffeemachine"     : return YandexDevice.CookingCoffee;
        case "curtain"           : return YandexDevice.OpenableCurtain;
        case "doorbell"          : return YandexDevice.SensorButton;
        case "fan"               : return YandexDevice.VentilationFan;
        case "garagedoor"        : return YandexDevice.Openable;
        case "heater"            : return YandexDevice.Thermostat;
        case "homealarm"         : return YandexDevice.Sensor;
        case "kettle"            : return YandexDevice.CookingKettle;
        case "light"             : return YandexDevice.Light;
        case "lock"              : return YandexDevice.Openable;
        case "other"             : return YandexDevice.Other;
        case "remote"            : return YandexDevice.MediaTv;
        case "sensor"            : return YandexDevice.Sensor;
        case "socket"            : return YandexDevice.Socket;
        case "speaker"           : return YandexDevice.Media;
        case "solarpanel"        : return YandexDevice.Other;
        case "sunshade"          : return YandexDevice.OpenableCurtain;
        case "thermostat"        : return YandexDevice.Thermostat;
        case "tv"                : return YandexDevice.MediaTv;
        case "vacuumcleaner"     : return YandexDevice.VacuumCleaner;
        case "windowcoverings"   : return YandexDevice.OpenableCurtain;

        // >=12.0.0
        case "airconditioning"   : return YandexDevice.ThermostatAc;
        case "bicycle"           : return YandexDevice.Other;
        case "battery"           : return YandexDevice.Sensor;
        case "car"               : return YandexDevice.Other;
        case "boiler"            : return YandexDevice.Thermostat;
        case "dehumidifier"      : return YandexDevice.Humidifier;
        case "dishwasher"        : return YandexDevice.Dishwasher;
        case "diffuser"          : return YandexDevice.Purifier;
        case "evcharger"         : return YandexDevice.Sensor;
        case "dryer"             : return YandexDevice.WashingMachine;
        case "cooktop"           : return YandexDevice.Cooking;
        case "faucet"            : return YandexDevice.OpenableValve;
        case "fireplace"         : return YandexDevice.Thermostat;
        case "freezer"           : return YandexDevice.Cooking;
        case "fridge_and_freezer": return YandexDevice.Cooking;
        case "fridge"            : return YandexDevice.Cooking;
        case "gameconsole"       : return YandexDevice.Other;
        case "grill"             : return YandexDevice.Cooking;
        case "heatpump"          : return YandexDevice.Thermostat;
        case "hood"              : return YandexDevice.Ventilation;
        case "humidifier"        : return YandexDevice.Humidifier;
        case "mediaplayer"       : return YandexDevice.Media;
        case "airtreatment"      : return YandexDevice.Purifier;
        case "lawnmower"         : return YandexDevice.Other;
        case "mop"               : return YandexDevice.Other;
        case "oven"              : return YandexDevice.Cooking;
        case "multicooker"       : return YandexDevice.CookingMulticooker;
        case "airpurifier"       : return YandexDevice.Purifier;
        case "petfeeder"         : return YandexDevice.PetFeeder;
        case "scooter"           : return YandexDevice.Other;
        case "radiator"          : return YandexDevice.Thermostat;
        case "settopbox"         : return YandexDevice.MediaTvBox;
        case "shutterblinds"     : return YandexDevice.OpenableCurtain;
        case "fryer"             : return YandexDevice.Cooking;
        case "smokealarm"        : return YandexDevice.SensorSmoke;
        case "vehicle"           : return YandexDevice.Other;
        case "washer"            : return YandexDevice.WashingMachine;
        case "airfryer"          : return YandexDevice.Cooking;
        case "washer_and_dryer"  : return YandexDevice.WashingMachine;
        case "waterpurifier"     : return YandexDevice.Other;
        case "waterheater"       : return YandexDevice.Thermostat;
        case "oven_and_microwave": return YandexDevice.Cooking;
        case "microwave"         : return YandexDevice.Cooking;
        case "watervalve"        : return YandexDevice.OpenableValve;
        case "sprinkler"         : return YandexDevice.OpenableValve;
        case "siren"             : return YandexDevice.Sensor;
        case "networkrouter"     : return YandexDevice.Other;
        default                  : return YandexDevice.Other;
    }
}

function getDeviceTypeByIcon(icon: string) {
    if (["light-led-strip", "christmas-lights"].includes(icon))
        return YandexDevice.LightStrip;

    if (icon.startsWith("light-hanging"))
        return YandexDevice.LightCeiling;

    if (icon.startsWith("light-"))
        return YandexDevice.Light;

    switch (icon) {
        // coverings
        case "window"     : return YandexDevice.Openable;
        case "window2"    : return YandexDevice.Openable;
        case "window3"    : return YandexDevice.Openable;
        case "blinds"     : return YandexDevice.OpenableCurtain;
        case "sunshade"   : return YandexDevice.OpenableCurtain;
        case "sunshade2"  : return YandexDevice.OpenableCurtain;
        case "curtains"   : return YandexDevice.OpenableCurtain;
        case "door"       : return YandexDevice.Openable;
        case "garage-door": return YandexDevice.Openable;

        // security
        case "camera"            : return YandexDevice.Camera;
        case "smoke-detector"    : return YandexDevice.SensorSmoke;
        case "motion-sensor"     : return YandexDevice.SensorMotion;
        case "door-window-sensor": return YandexDevice.SensorOpen;

        // appliances
        case "coffee-machine" : return YandexDevice.CookingCoffee;
        case "coffee-machine2": return YandexDevice.CookingCoffee;
        case "kettle"         : return YandexDevice.CookingKettle;
        case "airfryer"       : return YandexDevice.Cooking;
        case "microwave"      : return YandexDevice.Cooking;
        case "blender"        : return YandexDevice.Cooking;
        case "toaster"        : return YandexDevice.Cooking;
        case "cooking-plate"  : return YandexDevice.Cooking;
        case "extractor-hood" : return YandexDevice.VentilationFan;
        case "oven"           : return YandexDevice.Cooking;
        case "fridge"         : return YandexDevice.Cooking;
        case "vacuum-cleaner" : return YandexDevice.VacuumCleaner;

        // climate
        case "climate"    : return YandexDevice.ThermostatAc;
        case "climate2"   : return YandexDevice.ThermostatAc;
        case "climate3"   : return YandexDevice.ThermostatAc;
        case "fan"        : return YandexDevice.VentilationFan;
        case "fan2"       : return YandexDevice.VentilationFan;
        case "thermostat" : return YandexDevice.Thermostat;
        case "heating"    : return YandexDevice.Thermostat;
        case "cv"         : return YandexDevice.Thermostat;
        case "ventilation": return YandexDevice.VentilationFan;

        // switching
        case "switch-single": return YandexDevice.Switch;
        case "switch-double": return YandexDevice.Switch;
        case "plug"         : return YandexDevice.Socket;
        case "plug2"        : return YandexDevice.Socket;
        case "socket"       : return YandexDevice.Socket;

        // audio
        // multimedia

        // household
        case "smart-meter2": return YandexDevice.Meter;
        case "smart-meter3": return YandexDevice.Meter;

        // various
    }
}