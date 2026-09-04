# Project map

## Runtime boundary

`AZM_Lib.js` is the only runtime library. It imports the RoomOS-provided `xapi` module and exports `{ AZM }` as an ES module. The library is installed on a Cisco codec as an inactive macro and imported by an active application macro.

## Public surface

- `AZM.Command.Zone.Setup(configuration)` clones a Zone Configuration, resolves Ethernet connector IDs, creates the runtime zone/connector view, optionally enables Voice Activity Detection, and schedules passive update checks.
- `AZM.Command.Zone.Monitor.Start(cause)` and `.Stop(cause)` start/stop RoomOS VuMeter collection for codec-backed Connectors.
- `AZM.Command.Zone.List()` returns the current ordered Audio Zone views.
- `AZM.Status.Audio.Zone[id].get()` returns one zone view; `.State.get()` returns its Zone State.
- `AZM.Event.TrackZones.on(callback)` subscribes to the RoomOS audio events, external message-send events, and optional Voice Activity Detection signal, then emits Zone Events.

## Internal flow

1. Setup clones and normalizes the supplied Zone Configuration. Zone IDs are assigned from array order, starting at 1.
2. A `Zone_Tracker` owns the state aggregation for each Audio Zone.
3. A source-specific bucket collects Audio Samples: `Analog_Bucket`, `USB_Bucket`, `Ethernet_Bucket`, `ExternalVuMeter_Bucket`, or `ExternalGate_Bucket`.
4. Numeric buckets fill Sample Bins, calculate `Average`, `Peak`, and `Sample`, compare the average to Thresholds, and update the Zone Tracker.
5. Ethernet buckets evaluate configured SubIds independently, then aggregate those SubId states into the Connector state.
6. The callback receives the updated zone, the contributing Connector, integrator-defined Assets, and the evaluated DataSet.

## Supporting files

- `AZM_Sample_Macro.js`: a non-production example application showing setup, subscription, call-driven monitoring, prompts, and camera actions.
- `AZM_Sample_Mic_Configurations.js`: exported Sample Configurations for analog, Ethernet, AES67, USB, ExternalVuMeter, ExternalGate, mixed-source, split-SubId, and camera-asset scenarios.
- `README.md`: current user-facing installation, configuration, API, design, troubleshooting, and FAQ documentation.
- `legacy_readme_files/v0.8.0 and older/README.md`: historical documentation for the pre-1.0 library; retain it as evidence of legacy behavior and do not update it casually.
- `manifest.json`: release metadata consumed by the passive update checker.
- `images/`: documentation screenshots and audio-placement illustrations.

## Known boundary constraints

- RoomOS xAPI behavior cannot be fully validated locally because no codec is available in the repository test environment.
- The library extends native `Array` and `Object` prototypes for compatibility with its existing implementation. Treat removal or replacement as a compatibility-sensitive change.
- RoomOS event payloads and the external JSON message contract are integration boundaries; preserve their accepted aliases and callback shape.
