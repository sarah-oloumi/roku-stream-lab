import assert from "node:assert/strict";
import {
  createDeviceInfoProfile,
  createRoDeviceInfo,
  defaultDeviceInfoProfile,
  roDeviceInfoContract
} from "../src/runtime/rokuDeviceInfo.mjs";

{
  assert.deepEqual(createDeviceInfoProfile(), {
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
  assert.deepEqual(createDeviceInfoProfile(), defaultDeviceInfoProfile);
}

{
  const profile = createDeviceInfoProfile({
    model: "3941X",
    modelType: "STB",
    friendlyName: "Living Room Roku",
    deviceUniqueId: "000000000000",
    osVersion: {
      major: "14",
      minor: "1",
      revision: "0",
      build: "1234"
    },
    version: "141.00E01234A",
    isRIDADisabled: false
  });

  assert.deepEqual(profile, {
    model: "3941X",
    modelType: "STB",
    friendlyName: "Living Room Roku",
    deviceUniqueId: "000000000000",
    osVersion: {
      major: "14",
      minor: "1",
      revision: "0",
      build: "1234"
    },
    version: "141.00E01234A",
    isRIDADisabled: false
  });
}

{
  assert.throws(
    () => createDeviceInfoProfile({ displayMode: "1080p" }),
    /Unsupported roDeviceInfo profile field: displayMode/
  );
  assert.throws(
    () => createDeviceInfoProfile({ model: "" }),
    /model must be a non-empty string/
  );
  assert.throws(
    () => createDeviceInfoProfile({ osVersion: "14.1.0" }),
    /osVersion must be an object/
  );
  assert.throws(
    () => createDeviceInfoProfile({ osVersion: { major: "14", channel: "beta" } }),
    /Unsupported roDeviceInfo osVersion field: channel/
  );
  assert.throws(
    () => createDeviceInfoProfile({ osVersion: { major: "" } }),
    /osVersion field major must be a non-empty string/
  );
  assert.throws(
    () => createDeviceInfoProfile({ isRIDADisabled: "false" }),
    /isRIDADisabled must be a boolean/
  );
}

{
  const profile = createDeviceInfoProfile();
  const deviceInfo = createRoDeviceInfo();

  assert.equal(Object.isFrozen(profile), true);
  assert.equal(Object.isFrozen(profile.osVersion), true);
  assert.equal(Object.isFrozen(deviceInfo), true);
  assert.throws(
    () => {
      profile.model = "mutated";
    },
    /read only property|object is not extensible/
  );
  assert.throws(
    () => {
      deviceInfo.GetModel = () => "mutated";
    },
    /read only property|object is not extensible/
  );
}

{
  const first = createRoDeviceInfo({ friendlyName: "Bedroom Roku" });
  const second = createRoDeviceInfo();

  assert.equal(first.GetFriendlyName(), "Bedroom Roku");
  assert.equal(second.GetFriendlyName(), "Roku Stream Lab Emulator");
  assert.notEqual(first.getProfile(), second.getProfile());
}

{
  const deviceInfo = createRoDeviceInfo({
    model: "4802X",
    modelType: "STB",
    friendlyName: "Roku Ultra",
    deviceUniqueId: "000000000000",
    osVersion: {
      major: "14",
      minor: "1",
      revision: "0",
      build: "1234"
    },
    version: "141.00E01234A",
    isRIDADisabled: false
  });

  assert.equal(deviceInfo.GetModel(), "4802X");
  assert.equal(deviceInfo.GetModelType(), "STB");
  assert.equal(deviceInfo.GetFriendlyName(), "Roku Ultra");
  assert.equal(deviceInfo.GetDeviceUniqueId(), "000000000000");
  assert.deepEqual(deviceInfo.GetOSVersion(), {
    major: "14",
    minor: "1",
    revision: "0",
    build: "1234"
  });
  assert.equal(Object.isFrozen(deviceInfo.GetOSVersion()), true);
  assert.notEqual(deviceInfo.GetOSVersion(), deviceInfo.GetOSVersion());
  assert.equal(deviceInfo.GetVersion(), "141.00E01234A");
  assert.equal(deviceInfo.IsRIDADisabled(), false);
}

{
  const deviceInfo = createRoDeviceInfo();

  assert.deepEqual(roDeviceInfoContract.supportedMethods, [
    "GetModel",
    "GetModelType",
    "GetFriendlyName",
    "GetDeviceUniqueId",
    "GetOSVersion",
    "GetVersion",
    "IsRIDADisabled"
  ]);
  assert.equal(deviceInfo.CanDecodeVideo, undefined);
  assert.equal(roDeviceInfoContract.supportedMethods.includes("CanDecodeVideo"), false);
}

console.log("All Roku device info tests passed.");
