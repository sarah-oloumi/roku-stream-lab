import { createRoDeviceInfo, roDeviceInfoContract } from "./rokuDeviceInfo.mjs";

const supportedComponents = Object.freeze([roDeviceInfoContract.component]);
const componentContracts = deepFreeze({
  [roDeviceInfoContract.component]: roDeviceInfoContract
});

export const rokuRuntimeContract = deepFreeze({
  status: "partial",
  boundary: "host-runtime CreateObject registry",
  supportedComponents,
  componentContracts,
  notes: "Host-side registry only; this does not inject into BRS and does not emulate SceneGraph."
});

export function createRokuRuntime(options = {}) {
  if (!isPlainObject(options)) {
    throw new TypeError("Roku runtime options must be a plain object.");
  }

  const deviceInfoProfile = options.deviceInfoProfile ?? {};
  const registry = createRegistry({
    [roDeviceInfoContract.component.toLowerCase()]: () => createRoDeviceInfo(deviceInfoProfile)
  });

  return Object.freeze({
    contract: rokuRuntimeContract,
    metadata: rokuRuntimeContract,
    createObject: (componentName) => registry.createObject(componentName),
    requireObject: (componentName) => registry.requireObject(componentName),
    listSupportedComponents: () => [...supportedComponents]
  });
}

function createRegistry(factoriesByLowerName) {
  return Object.freeze({
    createObject(componentName) {
      const lookupName = normalizeComponentName(componentName);
      return factoriesByLowerName[lookupName]?.();
    },

    requireObject(componentName) {
      const component = this.createObject(componentName);
      if (component !== undefined) {
        return component;
      }

      throw new RangeError(`Unsupported Roku component: ${componentName}`);
    }
  });
}

function normalizeComponentName(componentName) {
  if (typeof componentName !== "string" || componentName.trim() === "") {
    throw new TypeError("Roku component name must be a non-empty string.");
  }

  return componentName.toLowerCase();
}

function isPlainObject(value) {
  return value !== null
    && typeof value === "object"
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function deepFreeze(value) {
  for (const nestedValue of Object.values(value)) {
    if (isPlainObject(nestedValue) || Array.isArray(nestedValue)) {
      deepFreeze(nestedValue);
    }
  }
  return Object.freeze(value);
}
