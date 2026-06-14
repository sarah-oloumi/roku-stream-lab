import assert from "node:assert/strict";
import { defaultDeviceInfoProfile } from "../src/runtime/rokuDeviceInfo.mjs";
import * as runtimeModule from "../src/runtime/rokuRuntime.mjs";

const { createRokuRuntime } = runtimeModule;

assert.equal(typeof createRokuRuntime, "function");

{
  const runtime = createRokuRuntime();
  const deviceInfo = runtime.createObject("roDeviceInfo");

  assert.equal(typeof runtime.createObject, "function");
  assert.equal(typeof runtime.requireObject, "function");
  assert.equal(typeof runtime.listSupportedComponents, "function");
  assert.deepEqual(runtime.listSupportedComponents(), ["roDeviceInfo"]);
  assert.equal(deviceInfo.GetModel(), defaultDeviceInfoProfile.model);
  assert.equal(deviceInfo.GetModelType(), defaultDeviceInfoProfile.modelType);
  assert.equal(deviceInfo.GetFriendlyName(), defaultDeviceInfoProfile.friendlyName);
  assert.deepEqual(deviceInfo.GetOSVersion(), defaultDeviceInfoProfile.osVersion);
  assert.equal(deviceInfo.IsRIDADisabled(), defaultDeviceInfoProfile.isRIDADisabled);
}

{
  const runtime = createRokuRuntime();

  assert.equal(runtime.createObject("rodeviceinfo").GetModel(), defaultDeviceInfoProfile.model);
  assert.equal(runtime.createObject("RODEVICEINFO").GetModel(), defaultDeviceInfoProfile.model);
  assert.equal(runtime.requireObject("RoDeviceInfo").GetModel(), defaultDeviceInfoProfile.model);
}

{
  const runtime = createRokuRuntime({
    deviceInfoProfile: {
      model: "4802X",
      friendlyName: "Roku Ultra",
      osVersion: {
        major: "14",
        minor: "1",
        revision: "0",
        build: "1234"
      },
      version: "141.00E01234A",
      isRIDADisabled: false
    }
  });
  const deviceInfo = runtime.createObject("roDeviceInfo");

  assert.equal(deviceInfo.GetModel(), "4802X");
  assert.equal(deviceInfo.GetFriendlyName(), "Roku Ultra");
  assert.deepEqual(deviceInfo.GetOSVersion(), {
    major: "14",
    minor: "1",
    revision: "0",
    build: "1234"
  });
  assert.equal(deviceInfo.GetVersion(), "141.00E01234A");
  assert.equal(deviceInfo.IsRIDADisabled(), false);
}

{
  const runtime = createRokuRuntime();

  assert.equal(runtime.createObject("roVideoPlayer"), undefined);
  assert.throws(
    () => runtime.requireObject("roVideoPlayer"),
    (error) => error instanceof RangeError
      && error.message === "Unsupported Roku component: roVideoPlayer"
  );
}

{
  const runtime = createRokuRuntime();

  for (const invalidName of ["", "   ", 42, null, undefined]) {
    assert.throws(
      () => runtime.createObject(invalidName),
      (error) => error instanceof TypeError
        && error.message === "Roku component name must be a non-empty string."
    );
    assert.throws(
      () => runtime.requireObject(invalidName),
      (error) => error instanceof TypeError
        && error.message === "Roku component name must be a non-empty string."
    );
  }
}

{
  assert.throws(
    () => createRokuRuntime(null),
    (error) => error instanceof TypeError
      && error.message === "Roku runtime options must be a plain object."
  );
  assert.throws(
    () => createRokuRuntime("invalid"),
    (error) => error instanceof TypeError
      && error.message === "Roku runtime options must be a plain object."
  );
}

{
  const runtime = createRokuRuntime();

  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(Object.isFrozen(runtime.contract), true);
  assert.equal(Object.isFrozen(runtime.contract.supportedComponents), true);
  assert.notEqual(runtime.listSupportedComponents(), runtime.listSupportedComponents());
  assert.throws(
    () => {
      runtime.createObject = () => undefined;
    },
    /read only property|object is not extensible/
  );
}

{
  const runtime = createRokuRuntime();
  const first = runtime.createObject("roDeviceInfo");
  const second = runtime.createObject("roDeviceInfo");

  assert.notEqual(first, second);
  assert.notEqual(first.getProfile(), second.getProfile());
}

assert.deepEqual(runtimeModule.rokuRuntimeContract.supportedComponents, ["roDeviceInfo"]);
assert.equal(
  runtimeModule.rokuRuntimeContract.componentContracts.roDeviceInfo.component,
  "roDeviceInfo"
);

console.log("All Roku runtime tests passed.");
