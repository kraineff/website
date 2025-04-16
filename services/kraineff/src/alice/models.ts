import { Elysia, type Static, t } from "elysia";

export type CapabilityParameters = Static<typeof CapabilityParameters>;
export const CapabilityParameters = t.Object({
	type: t.String(),
	retrievable: t.Optional(t.Boolean()),
	reportable: t.Optional(t.Boolean()),
	parameters: t.Object(t.Unknown()),
});

export type CapabilityState = Static<typeof CapabilityState>;
export const CapabilityState = t.Object({
	type: t.String(),
	state: t.Object({
		instance: t.String(),
		value: t.Union([t.String(), t.Number(), t.Boolean()]),
		relative: t.Optional(t.Boolean()),
	}),
});

export type Device = Static<typeof Device>;
export const Device = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Optional(t.String()),
	room: t.Optional(t.String()),
	type: t.String(),
	custom_data: t.Array(t.String()),
	capabilities: t.Array(t.Any()),
	properties: t.Array(t.Any()),
	device_info: t.Optional(
		t.Object({
			manufacturer: t.String(),
			model: t.String(),
			hw_version: t.Optional(t.String()),
			sw_version: t.Optional(t.String()),
		}),
	),
});

export type UserDevicesResponse = Static<typeof UserDevicesResponse>;
export const UserDevicesResponse = t.Object({
	request_id: t.String({ format: "uuid" }),
	payload: t.Object({
		user_id: t.String(),
		devices: t.Array(Device),
	}),
});

export type DeviceQuery = Static<typeof DeviceQuery>;
export const DeviceQuery = t.Object({
	id: t.String(),
	custom_data: t.Array(t.String()),
});

export type UserDevicesQuery = Static<typeof UserDevicesQuery>;
export const UserDevicesQuery = t.Object({
	devices: t.Array(DeviceQuery),
});

export type DeviceQueryResult = Static<typeof DeviceQueryResult>;
export const DeviceQueryResult = t.Object({
	id: t.String(),
	capabilities: t.Optional(t.Array(CapabilityState)),
	properties: t.Optional(t.Array(CapabilityState)),
	error_code: t.Optional(t.String()),
	error_message: t.Optional(t.String()),
});

export type UserDevicesQueryResponse = Static<typeof UserDevicesQueryResponse>;
export const UserDevicesQueryResponse = t.Object({
	request_id: t.String({ format: "uuid" }),
	payload: t.Object({
		devices: t.Array(DeviceQueryResult),
	}),
});

export type DeviceAction = Static<typeof DeviceAction>;
export const DeviceAction = t.Object({
	id: t.String(),
	custom_data: t.Array(t.String()),
	capabilities: t.Array(CapabilityState),
});

export type UserDevicesAction = Static<typeof UserDevicesAction>;
export const UserDevicesAction = t.Object({
	payload: t.Object({
		devices: t.Array(DeviceAction),
	}),
});

export type DeviceActionStatus = Static<typeof DeviceActionStatus>;
export const DeviceActionStatus = t.Object({
	status: t.String(),
	error_code: t.Optional(t.String()),
	error_message: t.Optional(t.String()),
});

export type DeviceActionCapabilityState = Static<typeof DeviceActionCapabilityState>;
export const DeviceActionCapabilityState = t.Object({
	type: t.String(),
	state: t.Object({
		instance: t.String(),
		action_result: t.Optional(DeviceActionStatus),
	}),
});

export type DeviceActionResult = Static<typeof DeviceActionResult>;
export const DeviceActionResult = t.Object({
	id: t.String(),
	capabilities: t.Optional(t.Array(DeviceActionCapabilityState)),
	action_result: t.Optional(DeviceActionStatus),
});

export type UserDevicesActionResponse = Static<typeof UserDevicesActionResponse>;
export const UserDevicesActionResponse = t.Object({
	request_id: t.String({ format: "uuid" }),
	payload: t.Object({
		devices: t.Array(DeviceActionResult),
	}),
});

export const AliceModels = new Elysia().model({
	"user.headers": t.Object({
		authorization: t.TemplateLiteral("Bearer ${string}"),
		"x-request-id": t.String({ format: "uuid", default: crypto.randomUUID() }),
		"user-agent": t.String({ pattern: "Yandex LLC", default: "" }),
	}),
	"user.unlink": t.Object({
		request_id: t.String({ format: "uuid" }),
	}),
	"user.devices.response": UserDevicesResponse,
	"user.devices.query": UserDevicesQuery,
	"user.devices.query.response": UserDevicesQueryResponse,
	"user.devices.action": UserDevicesAction,
	"user.devices.action.response": UserDevicesActionResponse,
});
