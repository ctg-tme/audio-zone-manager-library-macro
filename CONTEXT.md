# Audio Zone Manager

The Audio Zone Manager (AZM) is a RoomOS audio-automation domain: audio activity is assigned to spatial zones, evaluated into stable activity states, and surfaced with the room assets associated with those zones.

## Core language

**Audio Zone**:
A configured area of interest in a room whose activity is inferred from one or more audio connectors or external audio signals.
_Avoid_: region, channel group

**Zone State**:
The activity state of an Audio Zone: `Unset` before it has received evaluated audio, `High` when any contributing connector is active, or `Low` when all contributing connectors are inactive.
_Avoid_: status level, mode

**Connector**:
A configured audio source identified by a connector ID; it may be a codec input, an Ethernet microphone stream, a USB input, or an external source represented to AZM.
_Avoid_: microphone (when the source may be external), channel

**SubId**:
A selectable media channel within an Ethernet microphone connector that allows one physical microphone stream to contribute to separate Audio Zones.
_Avoid_: sub-channel, virtual connector

**Audio Source Type**:
The kind of source feeding a Connector: analog/microphone, USB, Ethernet, AES67, ExternalVuMeter, or ExternalGate.
_Avoid_: input class

**Audio Sample**:
A single observed audio measurement or external gate observation received for a Connector.
_Avoid_: reading (when referring to the domain object)

**Sample Bin**:
A temporary collection of Audio Samples accumulated until the configured sample size is reached and the values can be evaluated together.
_Avoid_: buffer (in user-facing domain language)

**Sampling Mode**:
The rule used to retain Audio Samples after evaluation: Snapshot clears the completed Sample Bin; Rolling removes only its oldest sample.
_Avoid_: processing profile

**Thresholds**:
The High and Low boundaries used to classify an evaluated audio measurement for a Connector. They may be shared by all zones or supplied independently for one Audio Zone.
_Avoid_: limits, trigger values

**Voice Activity Detection**:
A device-level signal that can reinforce a High classification when the evaluated audio exceeds the High threshold and RoomOS reports human voice activity.
_Avoid_: per-microphone voice detection

## Integration language

**External Data**:
Audio activity supplied by a system outside the codec through the RoomOS message-send path.
_Avoid_: remote audio (which can imply media transport)

**ExternalVuMeter**:
An External Data source that supplies numeric VuMeter values for Sample Bin evaluation.
_Avoid_: external meter

**ExternalGate**:
An External Data source that supplies open/close observations which AZM converts directly into Connector state.
_Avoid_: digital microphone

**Asset**:
Integrator-defined data associated with an Audio Zone and copied into the event callback so the consuming macro can act on room equipment or application state.
_Avoid_: resource, device (an Asset need not be hardware)

**Zone Event**:
The callback payload emitted after a Connector evaluation updates the corresponding Audio Zone view.
_Avoid_: notification (the payload is an integration event)

**Zone Configuration**:
The integrator-supplied settings and ordered list of Audio Zones used to construct AZM's runtime view.
_Avoid_: profile (a sample profile is an example Zone Configuration)

**Sample Configuration**:
One of the exported example Zone Configurations in `AZM_Sample_Mic_Configurations.js`, intended to be copied or adapted by an integrator.
_Avoid_: preset (unless referring to a camera preset inside an Asset)
