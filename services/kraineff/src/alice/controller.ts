import { AthomCloudAPI } from "homey-api";
import { Converters } from "./converters";
import { sql } from "bun";
import type {
	Device,
	DeviceAction,
	DeviceActionResult,
	DeviceQuery,
	DeviceQueryResult,
	UserDevicesResponse,
} from "./models";
import type { AthomStorage, HomeyAPI } from "./types/homey";

export class AliceController {
	private homeyApis = new Map<string, HomeyAPI>();
	private homeyConverters: Converters;
	private readonly CACHE_CLEANUP_INTERVAL = 30 * 60 * 1000;

	constructor(
		private clientId: string,
		private clientSecret: string,
	) {
		this.homeyConverters = new Converters();
		setInterval(() => this.homeyApis.clear(), this.CACHE_CLEANUP_INTERVAL);
	}

	private getStorageAdapter(token: string) {
		const storageAdapter = new AthomCloudAPI.StorageAdapter();

		storageAdapter.get = async () => {
			const [user] = await sql`SELECT * FROM homey_user WHERE token = ${token} LIMIT ${1}`;
			return (user && JSON.parse(user.storage)) || {};
		};

		storageAdapter.set = async (storage: AthomStorage) => {
			if (!storage.user) return;
			const homeyId = storage.user.homeys[0].id;
			const [user] = await sql`SELECT * FROM homey_user WHERE id = ${homeyId} LIMIT ${1}`;

			if (user)
				await sql`
                UPDATE homey_user
                SET token = ${token},
                    storage = ${JSON.stringify({ ...JSON.parse(user.storage), ...storage })}
                WHERE id = ${homeyId}
            `;
			else
				await sql`
                INSERT INTO homey_user (id, token, storage)
                VALUES (${homeyId}, ${token}, ${JSON.stringify(storage)})
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
			autoRefreshTokens: false,
		});

		// @ts-ignore
		const user = await athomApi.getAuthenticatedUserFromStore();
		return user as AthomCloudAPI.User;
	}

	private async getHomeyAPI(token: string) {
		const cacheHomeyApi = this.homeyApis.get(token);
		if (cacheHomeyApi) return cacheHomeyApi;

		const user = await this.getAthomUser(token);
		const homey = await user.getFirstHomey();
		const homeyApi = (await homey.authenticate({ strategy: "cloud" })) as unknown as HomeyAPI;

		this.homeyApis.set(token, homeyApi);
		return homeyApi;
	}

	async userRemove(token: string) {
		await this.getAthomUser(token);
		const [user] = await sql`SELECT * FROM homey_user WHERE token = ${token} LIMIT ${1}`;

		if (user) {
			this.homeyApis.delete(token);
			await sql`DELETE FROM homey_user WHERE id = ${user.id}`;
		}
	}

	async getDevices(token: string): Promise<UserDevicesResponse["payload"]> {
		const api = await this.getHomeyAPI(token);
		const devices = await api.devices.getDevices();
		const zones = await api.zones.getZones();
		const result: Device[] = [];
		
		await Promise.all(
			Object.values(devices)
				.filter((device) => !device.driverId.includes(":com.yandex:"))
				.map(async (device) => {
					const converterNames = Object.keys(device.capabilitiesObj);
					const converter = await this.homeyConverters.merge([...converterNames, device.driverId]);
					await converter.getDevice(device, zones)
						.then((device) => result.push(device))
						.catch(() => {});
				}),
		);

		return { user_id: api.id, devices: result };
	}

	async getStates(token: string, queries: DeviceQuery[]): Promise<DeviceQueryResult[]> {
		const api = await this.getHomeyAPI(token);
		const devices = await api.devices.getDevices();

		return await Promise.all(
			queries.map(async (query) => {
				const converterNames = query.custom_data;
				const converter = await this.homeyConverters.merge(converterNames);
				return await converter.getStates(devices, query.id);
			}),
		);
	}

	async setStates(token: string, actions: DeviceAction[]): Promise<DeviceActionResult[]> {
		const api = await this.getHomeyAPI(token);

		return await Promise.all(
			actions.map(async (action) => {
				const converterNames = action.custom_data;
				const converter = await this.homeyConverters.merge(converterNames);
				const capabilities = await converter.setStates(
					action.capabilities,
					async (capabilityId, value) => {
						await api.devices.setCapabilityValue({ capabilityId, deviceId: action.id, value });
					},
				);
				return { id: action.id, capabilities };
			}),
		);
	}
}
