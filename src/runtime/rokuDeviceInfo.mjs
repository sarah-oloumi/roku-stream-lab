const osVersionFields = Object.freeze(["major", "minor", "revision", "build"]);
const profileFields = Object.freeze([
  "model",
  "modelType",
  "friendlyName",
  "deviceUniqueId",
  "osVersion",
  "version",
  "isRIDADisabled"
]);

export const roDeviceInfoContract = Object.freeze({
  component: "roDeviceInfo",
  status: "partial",
  supportedMethods: Object.freeze([
    "GetModel",
    "GetModelType",
    "GetFriendlyName",
    "GetDeviceUniqueId",
    "GetOSVersion",
    "GetVersion",
    "IsRIDADisabled"
  ]),
  profileFields,
  notes: "Deterministic local development profile only; this is not a full Roku OS device model."
});

export const defaultDeviceInfoProfile = deepFreeze({
  model: "RSL-1000X",
  modelType: "STB",
  friendlyName: "Roku Stream Lab Emulator",
  deviceUniqueId: "000000000000",
  osVersion: {
    major: "12",
    minor: "5",
    revision: "0",
    build: "0000"
  },
  version: "125.00E00000A",
  isRIDADisabled: true
});

export function createDeviceInfoProfile(overrides = {}) {
  if (!isPlainObject(overrides)) {
    throw new TypeError("roDeviceInfo profile overrides must be a plain object.");
  }

  const unknownFields = Object.keys(overrides).filter((field) => !profileFields.includes(field));
  if (unknownFields.length > 0) {
    throw new RangeError(`Unsupported roDeviceInfo profile field: ${unknownFields.join(", ")}`);
  }

  const osVersion = overrides.osVersion === undefined || isPlainObject(overrides.osVersion)
    ? {
        ...defaultDeviceInfoProfile.osVersion,
        ...(overrides.osVersion ?? {})
      }
    : overrides.osVersion;
  const profile = {
    ...defaultDeviceInfoProfile,
    ...overrides,
    osVersion
  };

  for (const field of profileFields) {
    validateProfileField(field, profile[field]);
  }

  return deepFreeze(profile);
}

export function createRoDeviceInfo(overrides = {}) {
  const profile = createDeviceInfoProfile(overrides);

  return Object.freeze({
    GetModel: () => profile.model,
    GetModelType: () => profile.modelType,
    GetFriendlyName: () => profile.friendlyName,
    GetDeviceUniqueId: () => profile.deviceUniqueId,
    GetOSVersion: () => Object.freeze({ ...profile.osVersion }),
    GetVersion: () => profile.version,
    IsRIDADisabled: () => profile.isRIDADisabled,
    getProfile: () => profile
  });
}

function validateProfileField(field, value) {
  if (field === "isRIDADisabled") {
    if (typeof value !== "boolean") {
      throw new TypeError("roDeviceInfo profile field isRIDADisabled must be a boolean.");
    }
    return;
  }

  if (field === "osVersion") {
    validateOsVersion(value);
    return;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`roDeviceInfo profile field ${field} must be a non-empty string.`);
  }
}

function validateOsVersion(value) {
  if (!isPlainObject(value)) {
    throw new TypeError("roDeviceInfo profile field osVersion must be an object.");
  }

  const unknownFields = Object.keys(value).filter((field) => !osVersionFields.includes(field));
  if (unknownFields.length > 0) {
    throw new RangeError(`Unsupported roDeviceInfo osVersion field: ${unknownFields.join(", ")}`);
  }

  for (const field of osVersionFields) {
    if (typeof value[field] !== "string" || value[field].trim() === "") {
      throw new TypeError(`roDeviceInfo osVersion field ${field} must be a non-empty string.`);
    }
  }
}

function isPlainObject(value) {
  return value !== null
    && typeof value === "object"
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function deepFreeze(value) {
  for (const nestedValue of Object.values(value)) {
    if (isPlainObject(nestedValue)) {
      deepFreeze(nestedValue);
    }
  }
  return Object.freeze(value);
}
