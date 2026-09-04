# Backwards-compatibility contract

Treat the following as the AZM v1 public contract. Additive changes are preferred. A change to any item below needs an explicit compatibility review and matching README/sample updates.

## Import and lifecycle

- Keep the named import `import { AZM } from './AZM_Lib'` working.
- `AZM.Command.Zone.Setup(configuration)` must be awaited before accessing status, listing zones, subscribing, or starting/stopping monitoring.
- Zone IDs are assigned sequentially from the ordered `configuration.Zones` array, starting at `1`.
- Re-running Setup is supported for replacing the active Zone Configuration, including after Ethernet stream changes.

## Public names and state values

- Commands: `AZM.Command.Zone.Setup`, `AZM.Command.Zone.Monitor.Start`, `AZM.Command.Zone.Monitor.Stop`, `AZM.Command.Zone.List`.
- Statuses: `AZM.Status.Audio.Zone[id].get` and `AZM.Status.Audio.Zone[id].State.get`.
- Event: `AZM.Event.TrackZones.on(callback)`.
- Zone States: exactly `Unset`, `High`, and `Low` unless a new state is intentionally versioned and documented.
- Connector type aliases currently accepted by configuration include `Microphone`/`Analog`, `Ethernet`, `AES67`, `USB`, `ExternalVuMeter`, and `ExternalGate`. Event and xAPI mappings may use different canonical RoomOS names, so do not collapse aliases without checking both setup and subscription paths.

## Configuration contract

The established shape is `Settings` plus `Zones`. `Settings` contains `Sample.Size`, `Sample.Rate_In_Ms`, optional `Sample.Mode`, `GlobalThreshold.Mode`, `GlobalThreshold.High`, `GlobalThreshold.Low`, and optional `VoiceActivityDetection`. A zone contains `Label`, optional `ControllerId`, optional `Independent_Threshold`, `MicrophoneAssignment`, and arbitrary `Assets`. Connectors use `Id`, and Ethernet/AES67 connectors additionally use `Serial` or `StreamName` plus `SubId`.

Accepted behavior includes `Snapshot` and `Rolling` sampling, global or independent Thresholds, and Ethernet SubId selection. Do not silently alter default values or reinterpret missing fields.

## Event callback contract

Callbacks currently contain:

```js
{
  Zone: { Label, State, Id },
  Connector: { Type, State, Id, SubId? },
  Assets,
  DataSet: {
    VuMeter?: { Average, Peak, Sample },
    Gate?: string
  }
}
```

Keep integrator-defined `Assets` intact, preserve optional `SubId` semantics for Ethernet events, and retain the numeric VuMeter summary fields. External payload parsing is keyed by `Service: "AudioZoneManager"`, `SourceType`, `MicrophoneId`, `ControllerId`, and either `VuMeter` or `Gate`.

## Release and documentation invariants

- Keep the internal library `version` and `manifest.json.version` synchronized for releases.
- Keep `manifest.json.roomos` and README minimum-version statements aligned with the actual RoomOS APIs used.
- Update current README examples and exported samples when public behavior changes. Preserve the legacy README as historical material unless the user explicitly asks for a historical correction.
- Record a new ADR only for a hard-to-reverse, surprising decision with real alternatives; compatibility notes belong here, not in `CONTEXT.md`.

The current repository baseline has known documentation metadata drift: `AZM_Lib.js` reports internal version `1.0.0`, while `manifest.json` reports `1.0.1`; the manifest also says MTR support is known as of RoomOS 11.20.x while the README still describes that compatibility as unknown. Do not reconcile either difference in an unrelated change; treat them as release/documentation work requiring an explicit decision.
