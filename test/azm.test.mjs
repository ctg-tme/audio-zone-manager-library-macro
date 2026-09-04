import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function eventBus() {
  const handlers = [];
  return {
    handlers,
    on(handler) { handlers.push(handler); return handler; },
    async emit(payload) {
      for (const handler of [...handlers]) await handler(payload);
    }
  };
}

function makeXapi() {
  const buses = {
    ethernet: eventBus(),
    microphone: eventBus(),
    usb: eventBus(),
    message: eventBus(),
    streamName: eventBus(),
    voice: eventBus()
  };
  const commands = { start: [], stop: [] };
  const state = { ethernet: [], peripherals: [] };
  const xapi = {
    buses,
    commands,
    state,
    Config: {
      Audio: { Microphones: { VoiceActivityDetector: { Mode: { set: async () => {} } } } },
      HttpClient: { get: async () => ({ Mode: 'On' }), Mode: { set: async () => {} } }
    },
    Command: { Audio: { VuMeter: {
      Start: async payload => commands.start.push(payload),
      Stop: async payload => commands.stop.push(payload)
    } } },
    Event: { Audio: { Input: { Connectors: {
      Ethernet: { on: handler => buses.ethernet.on(handler) },
      Microphone: { on: handler => buses.microphone.on(handler) },
      USBMicrophone: { on: handler => buses.usb.on(handler) }
    } } }, Message: { Send: { on: handler => buses.message.on(handler) } } },
    Status: {
      SystemUnit: { Software: { Version: { get: async () => '11.20.1.1' } } },
      Peripherals: { ConnectedDevice: { get: async () => state.peripherals } },
      Audio: {
        Input: { Connectors: {
          Ethernet: { get: async () => state.ethernet, '*': { StreamName: { on: handler => buses.streamName.on(handler) } } }
        } },
        Microphones: { VoiceActivityDetector: { Activity: { on: handler => buses.voice.on(handler) } } }
      }
    }
  };
  return xapi;
}

function loadLibrary(xapi) {
  const source = fs.readFileSync(new URL('../AZM_Lib.js', import.meta.url), 'utf8')
    .replace("import xapi from 'xapi';", '')
    .replace('export { AZM };', 'globalThis.__AZM = AZM;');
  const context = vm.createContext({
    console: { log() {}, info() {}, warn() {}, error() {}, debug() {} },
    xapi,
    setTimeout,
    clearTimeout,
    Date,
    Promise,
    Set,
    Map,
    JSON,
    Math,
    Number,
    String,
    Object,
    Array,
    Error
  });
  vm.runInContext(source, context);
  return { AZM: context.__AZM, context };
}

function loadSamples(context) {
  const source = fs.readFileSync(new URL('../AZM_Sample_Mic_Configurations.js', import.meta.url), 'utf8')
    .replace(/export \{[\s\S]*?\};\s*$/, 'globalThis.__samples = { One_Analog_Mic_One_Zone, Two_Analog_Mic_One_Zone, Two_Analog_Mic_Two_Zone, One_CiscoEthernet_Mic_One_Zone, Two_CiscoEthernet_Mic_One_Zone, Two_CiscoEthernet_Mic_Two_Zone, One_CiscoEthernet_Mic_SplitAcross_Two_Zone, One_AES67_Mic_One_Zone, Two_AES67_Mic_One_Zone, Two_AES67_Mic_Two_Zone, One_USB_Mic_One_Zone, One_ExternalVuMeter_Mic_One_Zone, Two_ExternalVuMeter_Mic_One_Zone, Two_ExternalVuMeter_Mic_Two_Zone, One_ExternalGate_Mic_One_Zone, Two_ExternalGate_Mic_One_Zone, Two_ExternalGate_Mic_Two_Zone, All_Mic_Types_Separate_Zones, Simple_AnalogMic_Camera_Example };');
  vm.runInContext(source, context);
  return context.__samples;
}

function config(zones, extraSettings = {}) {
  return {
    Settings: {
      Sample: { Size: 4, Rate_In_Ms: 100, Mode: 'Snapshot' },
      GlobalThreshold: { Mode: 'On', High: 30, Low: 20 },
      VoiceActivityDetection: 'Off',
      ...extraSettings
    },
    Zones: zones
  };
}

function analogZone(label, connectorId, assets = {}) {
  return {
    Label: label,
    MicrophoneAssignment: { Type: 'Microphone', Connectors: [{ Id: connectorId }] },
    Assets: assets
  };
}

function ethernetZone(label, selector, subIds = [1, 2]) {
  return {
    Label: label,
    MicrophoneAssignment: { Type: 'Ethernet', Connectors: [{ ...selector, SubId: subIds }] },
    Assets: {}
  };
}

function inContext(value, context) {
  return vm.runInContext(`(${JSON.stringify(value)})`, context);
}

test('legacy setup supports shared physical analog sources and deduplicates monitor commands', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const { AZM } = loaded;
  const configuration = inContext(config([
    analogZone('Left', 1, { side: 'left' }),
    { ...analogZone('Right', 1, { side: 'right' }), MicrophoneAssignment: { Type: 'Analog', Connectors: [{ Id: 1 }] } }
  ]), loaded.context);
  await AZM.Command.Zone.Setup(configuration);
  assert.equal(Object.keys(AZM.Status.Audio.Source).length, 1);
  const callbacks = [];
  const callback = payload => callbacks.push(payload);
  AZM.Event.TrackZones.on(callback);
  AZM.Event.TrackZones.on(callback);
  assert.equal(xapi.buses.microphone.handlers.length, 1);
  await AZM.Command.Zone.Monitor.Start('test');
  await AZM.Command.Zone.Monitor.Stop('test');
  assert.equal(xapi.commands.start.length, 1);
  assert.equal(xapi.commands.stop.length, 1);
  for (const value of [40, 40, 40, 40]) {
    await xapi.buses.microphone.emit({ id: 1, VuMeter: String(value), PPMeter: '0', NoiseLevel: '0', LoudspeakerActivity: '0' });
  }
  assert.deepEqual(callbacks.map(payload => payload.Zone.Id).sort(), [1, 2]);
});

test('setup atomically retires the previous runtime graph', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const { AZM } = loaded;
  await AZM.Command.Zone.Setup(inContext(config([analogZone('Old', 1)]), loaded.context));
  const callbacks = [];
  AZM.Event.TrackZones.on(payload => callbacks.push(payload));
  await AZM.Command.Zone.Setup(inContext(config([analogZone('New', 2)]), loaded.context));
  assert.equal(AZM.Command.Zone.List().length, 1);
  assert.equal(AZM.Command.Zone.List()[0].Label, 'New');
  await xapi.buses.microphone.emit({ id: 1, VuMeter: '40', PPMeter: '0', NoiseLevel: '0', LoudspeakerActivity: '0' });
  assert.equal(callbacks.length, 0);
});

test('temporarily absent Ethernet sources are pending and retry after stream discovery', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const { AZM } = loaded;
  const configuration = inContext(config([ethernetZone('Table', { Serial: 'SERIAL-1' })]), loaded.context);
  await AZM.Command.Zone.Setup(configuration);
  assert.equal(AZM.Command.Zone.List()[0].Health, 'pending');
  assert.equal(AZM.Status.Audio.Diagnostics[0].Code, 'SOURCE_PENDING');
  const callbacks = [];
  AZM.Event.TrackZones.on(payload => callbacks.push(payload));
  assert.equal(xapi.buses.ethernet.handlers.length, 1);
  assert.equal(xapi.buses.streamName.handlers.length, 1);
  xapi.state.ethernet = [{ id: 9, StreamName: 'stream-1' }];
  xapi.state.peripherals = [{ Type: 'AudioMicrophone', SerialNumber: 'SERIAL-1', ID: 'stream-1' }];
  await xapi.buses.streamName.emit({});
  assert.equal(AZM.Command.Zone.List()[0].Health, 'ready');
  for (const value of [40, 40, 40, 40]) {
    await xapi.buses.ethernet.emit({ id: 9, SubId: [{ id: 1, VuMeter: String(value), PPMeter: '0', NoiseLevel: '0', LoudspeakerActivity: '0' }] });
  }
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(callbacks.length, 2);
  assert.deepEqual(callbacks.map(payload => String(payload.Connector.SubId)).sort(), ['1', '2']);
});

test('invalid Ethernet selectors fail with a zone-specific diagnostic', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const { AZM } = loaded;
  await assert.rejects(
    AZM.Command.Zone.Setup(inContext(config([ethernetZone('Missing selector', {})]), loaded.context)),
    error => error.message.includes('INVALID_SOURCE_SELECTOR') && error.message.includes('Missing selector')
  );
});

test('missing-source policy can expose an unavailable Ethernet source', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  await loaded.AZM.Command.Zone.Setup(inContext(
    config([ethernetZone('Unavailable', { StreamName: 'not-present' })], { MissingSourcePolicy: 'unavailable' }),
    loaded.context
  ));
  assert.equal(loaded.AZM.Command.Zone.List()[0].Health, 'unavailable');
  assert.equal(loaded.AZM.Status.Audio.Source['Ethernet:stream:not-present'].Health, 'unavailable');
});

test('shared external connector IDs route by controller without overwriting buckets', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const { AZM } = loaded;
  await AZM.Command.Zone.Setup(inContext(config([
    { Label: 'One', ControllerId: 'a', MicrophoneAssignment: { Type: 'ExternalGate', Connectors: [{ Id: 5 }] }, Assets: {} },
    { Label: 'Two', ControllerId: 'b', MicrophoneAssignment: { Type: 'ExternalGate', Connectors: [{ Id: 5 }] }, Assets: {} }
  ]), loaded.context));
  const callbacks = [];
  AZM.Event.TrackZones.on(payload => callbacks.push(payload));
  await xapi.buses.message.emit({ Text: JSON.stringify({ Service: 'AudioZoneManager', SourceType: 'ExternalGate', MicrophoneId: 5, ControllerId: 'b', Gate: 'open' }) });
  assert.equal(callbacks.length, 1);
  assert.equal(callbacks[0].Zone.Id, 2);
  await xapi.buses.message.emit({ Text: JSON.stringify({ Service: 'AudioZoneManager', SourceType: 'ExternalGate', MicrophoneId: 99, ControllerId: 'b', Gate: 'open' }) });
  assert.equal(AZM.Status.Audio.Diagnostics.at(-1).Code, 'UNMATCHED_EXTERNAL_EVENT');
});

test('all exported legacy sample configurations remain setup-compatible', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  const samples = loadSamples(loaded.context);
  for (const [name, sample] of Object.entries(samples)) {
    await loaded.AZM.Command.Zone.Setup(sample);
    assert.ok(loaded.AZM.Command.Zone.List().length > 0, name);
  }
});

test('missing top-level configuration produces an AZM diagnostic instead of a native TypeError', async () => {
  const xapi = makeXapi();
  const loaded = loadLibrary(xapi);
  await assert.rejects(
    loaded.AZM.Command.Zone.Setup(undefined),
    error => error.message.includes('INVALID_CONFIGURATION') && !error.message.includes('TypeError')
  );
});
