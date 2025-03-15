import { AthomCloudAPI, HomeyAPIV2 } from "homey-api";
import { Converters } from "./converters";
import { ActionDevice, ActionDevicesRequest, ActionDevicesResponse, DiscoveryDevicesResponse, QueryDevicesRequest, QueryDevicesResponse } from "./types";
import { sql } from "bun";

export class AliceController {
    private homeyApis = new Map<string, any>();
    private homeyConverters: Converters;
    private readonly CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000;

    constructor(private clientId: string, private clientSecret: string) {
        this.homeyConverters = new Converters();
        setInterval(() => this.homeyApis.clear(), this.CACHE_CLEANUP_INTERVAL);
    }

    private getStorageAdapter(token: string) {
        const storageAdapter = new AthomCloudAPI.StorageAdapter();

        storageAdapter.get = async () => {
            const [user] = await sql`SELECT * FROM "User" WHERE token = ${token} LIMIT ${1}`;
            return user && JSON.parse(user.storage) || {};
        };

        storageAdapter.set = async (storage: any) => {
            if (!storage.user) return;
            const homeyId = storage.user.homeys[0].id;
            const [user] = await sql`SELECT * FROM "User" WHERE id = ${homeyId} LIMIT ${1}`;

            if (user) await sql`
                UPDATE "User"
                SET token = ${token},
                    storage = ${JSON.stringify({ ...JSON.parse(user.storage), ...storage })}
                WHERE id = ${homeyId}
            `;
            else await sql`
                INSERT INTO "User" (id, token, storage)
                VALUES (${homeyId}, ${token}, ${storage})
            `;
        };

        return storageAdapter;
    }

    private async getAthomUser(token: string) {
        const athomApi = new AthomCloudAPI({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUrl: "https://social.yandex.net/broker/redirect",
            // @ts-ignore
            token: new AthomCloudAPI.Token({ access_token: token }),
            store: this.getStorageAdapter(token),
            autoRefreshTokens: false
        });
        
        // @ts-ignore
        const user = await athomApi.getAuthenticatedUserFromStore();
        return user as AthomCloudAPI.User;
    }

    private async getHomeyAPI(token: string) {
        if (token in this.homeyApis) return this.homeyApis.get(token);
        
        const user = await this.getAthomUser(token);
        const homey = await user.getFirstHomey();
        const homeyApi = await homey.authenticate({ strategy: "cloud" });

        this.homeyApis.set(token, homeyApi);
        return this.homeyApis.get(token);
    }

    async userRemove(token: string) {
        await this.getAthomUser(token);
        const [user] = await sql`SELECT * FROM "User" WHERE token = ${token} LIMIT ${1}`;

        if (user) {
            this.homeyApis.delete(token);
            await sql`DELETE FROM "User" WHERE id = ${user.id}`;
        }
    }

    async getDevices(token: string) {
        const homeyApi = await this.getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        const homeyZones: Record<string, HomeyAPIV2.ManagerZones.Zone> = await homeyApi.zones.getZones();
        const payload: DiscoveryDevicesResponse["payload"] = {
            user_id: homeyApi.id, devices: []
        };

        await Promise.all(
            Object.values(homeyDevices)
                .filter(homeyDevice => !homeyDevice.driverId.includes(":com.yandex:"))
                .map(async homeyDevice => {
                    const converterNames = Object.keys(homeyDevice.capabilitiesObj);
                    const converter = await this.homeyConverters.merge([...converterNames, homeyDevice.driverId]);
                    const device = await converter.getDevice(homeyDevice, homeyZones);
                    device && payload.devices.push(device);
                })
        );

        return payload;
    }

    async getStates(token: string, body: QueryDevicesRequest) {
        const homeyApi = await this.getHomeyAPI(token);
        const homeyDevices: Record<string, HomeyAPIV2.ManagerDevices.Device> = await homeyApi.devices.getDevices();
        const payload: QueryDevicesResponse["payload"] = {
            devices: []
        };

        await Promise.all(
            body.devices.map(async query => {
                const converterNames = query.custom_data;
                const converter = await this.homeyConverters.merge(converterNames);
                const device = await converter.getStates(query.id, homeyDevices[query.id]);
                payload.devices.push(device);
            })
        );
        
        return payload;
    }

    async setStates(token: string, body: ActionDevicesRequest) {
        const homeyApi = await this.getHomeyAPI(token);
        const payload: ActionDevicesResponse["payload"] = {
            devices: []
        };
        
        await Promise.all(
            body.payload.devices.map(async action => {
                const deviceId = action.id;
                const device: ActionDevice = {
                    id: deviceId, capabilities: []
                };
    
                const converter = await this.homeyConverters.merge(action.custom_data);
                const converterSet = async (capabilityId: string, value: any) =>
                    homeyApi.devices.setCapabilityValue({ capabilityId, deviceId, value });
    
                const states = await converter.setStates(action.capabilities, converterSet);
                device.capabilities = states.capabilities;
                payload.devices.push(device);
            })
        );

        return payload;
    }
}