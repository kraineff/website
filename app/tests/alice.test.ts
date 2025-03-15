import { sql } from "bun";
import { describe, expect, test } from "bun:test";
import { AliceController } from "../src/alice/controller";
import { DiscoveryDevice } from "../src/alice/types";

describe("Тесты алисы", () => {
    const controller = new AliceController(Bun.env.HOMEY_ID!, Bun.env.HOMEY_SECRET!);
    let token: string;
    let device: DiscoveryDevice;

    test("должен вернуть токен пользователя", async () => {
        const [user] = await sql`SELECT * FROM "User" WHERE id = ${"6407152258e4600b841445be"} LIMIT ${1}`;
        token = user.token as string;
        expect(token).toBeDefined();
    });

    test("должен вернуть список устройств", async () => {
        const response = await controller.getDevices(token);
        device = response.devices[0];
        expect(response).toBeDefined();
        expect(response.devices).not.toBeArrayOfSize(0);
    });

    test("должен вернуть состояние устройства", async () => {
        const response = await controller.getStates(token, {
            devices: [{
                id: device.id,
                custom_data: device.custom_data
            }]
        });
        expect(response).toBeDefined();
        expect(response.devices).toBeArrayOfSize(1);
    });
});