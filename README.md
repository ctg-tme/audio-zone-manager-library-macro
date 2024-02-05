# Audio Zone Manager Library (AZM_Lib)

## About

- The Audio Zone Manager (AZM) is a suite of tools that processes Audio Data coming into your Cisco Codec and provides custom Commands, Statuses and Events for you to build Audio Automations through the devices Macro Editor

[![Example Zone Visual](/images/cover_image.png)](#)

| Minimum RoomOs Version | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 11.8.X                 | ✅ Yes       | ✅ Yes                    | ✅ Yes     | ❌ No - API Limitation<br>(Dec 9 2023)      | 

## Table of Contents (ToC)
- [Before you Start!](#before-you-start-)
- [Device Requirements](#device-requirements-)
- [AZM Audio Configuration](#azm-audio-configuration-)
- [AZM Library Reference](#azm-library-reference-)
  - [Commands](#)
  - [Statuses](#)
  - [Events](#)
- [Audio Design Considerations](#audio-design-considerations-)
- [TroubleShooting](#troubleshooting-)
- [Sample Use Cases](#sample-use-cases-)
- [FAQ](#faq-)
  - [Is this Macro Supported?](#)
  - [When does a Zone Change State?](#)
  - [How is the Audio data evaluated?](#)
  - [Can I edit this Macro?](#)

> Press on the Menu Icon to come back to the Table of Contents [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

## Before you Start [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- Please review this doc in full before jumping in. This is not a plug and play macro, it does require some setup as every space is unique
- If you have any questions, please refer the FAQ Section at the bottom
- Please review the Device Requirements below, before loading this into a project

## Device Requirements [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Minimum RoomOS Software Version
- RoomOS 11.8.X

### Registration Compatibility

| Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:------------|:--------------------------|:-----------|:-----------------------------------------|
| ✅ Yes       | ✅ Yes                    | ✅ Yes     | ❌ No - API Limitation<br>(Dec 9 2023)      | 

### Tested Codec Models

|Product                 |
|:-----------------------|
| Codec Pro              |
| Codec EQ               |

## AZM Audio Configuration [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- Audio Zone Manager needs to be configured before use
- Your configurations teach the Macro [To-Do]

- - -

## AZM Library Reference [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Commands

#### AZM.Command.Zone.Setup(AudioConfiguration)

- Description: Initializes all Zones and Audio Input Connectors within the scope of your Project. Review the AZM AudioConfiguration Section of this Guide to learn how to configure
- Architecture: Asynchronous
- Required: Yes
  - **NOTE**: This function should run before accessing all other objects within AZM
- Parameters: AudioConfiguration
- Sample Use

```javascript
import xapi from 'xapi';

//import the Audio Zone Manager Library
import { AZM } from './AZM_Lib';

//Create you Audio Configuration Object
const AudioConfiguration = {/* Populate this Object */};

//Define your Script initialization function
async function init(){
  await AZM.Command.Zone.Setup(AudioConfiguration);
  
  //Your Code
};

//More Code
```

#### AZM.Command.Zone.Monitor.Start()
- Description: Starts VuMeter sampling on Audio Input connectors defined in AudioConfiguration object.
  - **NOTE**: Enabling the VuMeter will turn ON the LED light on Cisco Microphones, even if off a call
- Architecture: Asynchronous
- Required: No
- Parameters: N/A
- Sample Use

```javascript
xapi.Event.CallSuccessfull.on(async event => {
  await AZM.Command.Zone.Monitor.Start();
});
```

#### AZM.Command.Zone.Monitor.Stop()
- Description: Stops VuMonitoring on configured Audio Inputs
    - **NOTE**: Disabling the VuMeter will turn OFF the LED light on Cisco Microphones, unless you're connected to a call
- Architecture: Asynchronous
- Required: No
- Parameters: N/A
- Sample Use

```javascript
xapi.Event.CallDisconnect.on(async event => {
  await AZM.Command.Zone.Monitor.Stop();
});
```

### Statuses

#### AZM.Status.Audio.Zone[ZoneId].get()
- Description: Get information about your zone by ZoneId when 
  - **NOTE**: ZoneId's are appended to your AudioConfiguration object when AZM.Command.Zone.Setup(AudioConfiguration) has run. ZoneId's are sequential, based on the index of your Audio Zones, starting at 1
- Architecture: Synchronous
- Required: No
- Parameters: N/A
- Sample Use and Result

```javascript
console.log(AZM.Status.Audio.Zone[1].get());

/*
Result
{ 
  Id: Integer,                        // The ZoneId you requested
  Label: String,                      // The ZoneLabel you Provided
  Connectors: Array,                  // An array of ConnectorIds
  State: <'Unset', 'High' or 'Low'>   // The State of a Zone
}
*/
```

#### AZM.Status.Audio.Zone[ZoneId].State.get()
- Description: Get the State of your zone by ZoneId when 
  - **NOTE**: ZoneId's are appended to your AudioConfiguration object when AZM.Command.Zone.Setup(AudioConfiguration) has run. ZoneId's are sequential, based on the index of your Audio Zones, starting at 1
- Architecture: Synchronous
- Required: No
- Parameters: N/A
- Sample Use and Result

```javascript
console.log(AZM.Status.Audio.Zone[1].get());

/*
Result
'Unset', 'High' or 'Low'              // The State of a Zone
*/
```

### Events

#### AZM.Event.TrackZones.on(event => ...)
- Description: Subscribe to changes to all Zone events defined within your scope. 
  This event will callback any updates to your zone, even if the update is identical.
  - **NOTE**: As events come in, AZM.Event.TrackZones.on will update the state in  AZM.Status.Audio.Zone[ZoneId].State.get() and  AZM.Status.Audio.Zone[ZoneId].get()
- Required: No
- Parameters: event
- Sample Use and Event Callback

```javascript
AZM.Event.TrackZones.on(event => {
    console.log(event)
    //As the events Change a message will show on the OSD indicating the Zone State
    xapi.Command.UserInterface.Message.Alert.Display({
      Title: event.Zone.Label,
      Text: `ZoneId: [${event.Zone.Id}] state set to [${event.Zone.State}]`
    })
  })

/*
Event Callback

{
  Zone: {                                   // Information about the Zone that caused the Callback to fire
    Label: String,                          // The name of the Zone provided in the AudioConfiguration
    State: <'Unset', 'High' or 'Low'>,      // The current State of the Zone
    Id: Integer                             // The ZoneId of the newest Zone Callback
  },
  Connector: {                              // Information about the Connector/SubId that caused the Callback to fire
    Type: <'Ethernet', 'AES67', 'Microphone', 'Analog' or 'USB'>, // The Type of Microphone Connector
    State: <'Unset', 'High' or 'Low'>,      // The current state of this Connector 
    Id: Integer,                            // The ID of the connector
    SubId: Integer                          // The SubId responsible for the Callback to fire
  },
  Assets: {},                               // Developer Defined Assets to Track
  DataSet: {                                // The original data processed in the event
    VuMeter: {                              // Data associated to the VuMeter
      Average: Integer,                     // The average value of the DataSet
      Peak: Integer,                        // The Peak Value of the DataSet
      Sample: Array                         // The raw set of data evaluated
    }
  }
}

*/
```

- - -

## Audio Design Considerations [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- Refining an Audio Zone in your space requires good control of your physical audio resources
- It's recommended to use Directional Microphones or a Microphone Array with clearly Defined Zones
- Audio Zones with too much overlap in their pickup fields will produce false positives in your zones

Below is an example image of Good Audio placement using the Cisco Table Microphone Pro as the microphone model (Image not to scale)

![Good_Audio_Placement](#)

Here is an example image of Poor Audio Placement, again using the Cisco Table Microphone Pro (Image not to scale)

![Poor_Audio_Placement](#)

## TroubleShooting [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- AZM's base script has a few select logs to print to the console which has meaning for a live deployment
- However, there are additional logs you can enable in the AZM library itself you can use to troubleshoot a specific process, should you need too
- These logs need to be turned on in the AZM_Lib macro, starting on line 84

```
const config_settings_DebugUtil_SetupDbug = false;
const config_settings_DebugUtil_StartStopMonitorDbug = false;
const config_settings_DebugUtil_RawAudioData = false;
const config_settings_DebugUtil_ZoneDbug = false;
const config_settings_DebugUtil_EthernetBucketDbug = false;
const config_settings_DebugUtil_AnalogBucketDbug = false;
const config_settings_DebugUtil_AdvancedDbug = false;
```

Setting any of the above values to **```true```** will enable more logs to print to the Macro Console
- To view these logs, you must also enable the Debug log level under the Severity drop down in the Macro Console

![Severity_Screenshot](#)

## Sample Use Cases [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
### Camera Automation
  - Leveraging the Zone States emitted by this script, you can:
    - Switch between different connectors as folks speak in different Audio Zones you define
    - Enable an extended Zoom Range for the base speakertracking solution provided by the codec
    
### Audio Ducking
  - Leveraging the Zone States emitted by this script, you can dynamically raise or lower Microphone input Gain in a space
  
### Screen Layout Automation
  - Leveraging the Zone States emitted by this script, you can alter the layouts of your screens as a speaker transitions between specific Audio Zones

## FAQ [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Is this Macro Supported?
- No, all Macros are considered Custom Code by Cisco and are not supported.

### When does a Zone Change State?
- There are several rules in place to set the State of a Zone
- States
  - High: When at least 1 Audio ConnectorId, or SubId in the case of Ethernet Microphones, defined within a Zone moves to a High State. 
  - Low: When all Audio ConnectorIds, or SubIds, defined within a Zone move to a Low State
  - Unset: This only occurs on setup, when no audio data has been fed into the script. If at least 1 Audio ConnectorId, or SubIds, are Low or High, the Zone is no longer Unset

### How is the Audio data evaluated?
- in Version 0.7.0 of the AZM Lib, only the Audio VuMeter data is evaluated
- This data is packaged into **```"bins"```** that are instantiated in an **```[X]_Bucket```** Class during the Zone Setup process
- These bins will fill up at a pace that's defined by both your **```Sample Size```** and **```Sample Rate```** value in the AudioConfiguration Object
- Once a bin matches the **```Sample Size```** value, the data collected is then Averaged and Compared against the **```High```** and **```Low```** thresholds set in the AudioConfiguration Object, then the bin is cleared for the next batch of data
- If the Average is equal to or above the **```High```** threshold, the connector associated to the incoming data is set to a **```High```** State
  - Else if the Average is equal to or above the **```Low```** threshold, the connector associated to the incoming data is set to a **```Low```** State
- The new Connector State is then passed up into the Zone Status, and further compared to the additional connector states within the Zone to determine the Zone State


### Can I edit this Macro?
- Of Course, it's an Open Script, feel free to edit it to your liking