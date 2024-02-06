# Audio Zone Manager Library (AZM_Lib)

## About

- The Audio Zone Manager (AZM) is a suite of tools that processes Audio Data coming into your Cisco Codec and provides custom Commands, Statuses and Events for you to build Audio Automations through the devices Macro Editor

[![Example Zone Visual](/images/cover_image.png)](#)

| Minimum RoomOs Version | Webex Cloud | Webex Edge (Hybrid Cloud) | On-Premise | Microsoft Teams Room<br>On Cisco Devices |
|:-----------------------|:------------|:--------------------------|:-----------|:-----------------------------------------|
| 11.8.X                 | ✅ Yes       | ✅ Yes                    | ✅ Yes     | ❌ No - API Limitation<br>(Dec 9 2023)   | 

## Table of Contents
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
- [Tutorial Videos](#tutorial-videos-)
- [FAQ](#faq-)
  - Is this Macro Supported?
  - When does a Zone Change State?
  - Can I have multiple Zone configurations?
  - Can I run 2 different Audio solutions using AZM on the Same Codec?
  - How is the Audio data evaluated?
  - Can I edit this Macro?

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

- - -

## AZM Audio Configuration [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- Audio Zone Manager needs to be configured before use
- Your configurations teach the Macro where your audio resources are listening in relation to the assets you assigned them
- Though the configuration must be run at the start, you can recall the configuration setup command at any time in the script, should you have a solution that requires zones to be altered, such as a Combine and Divide space

#### Code View
```javascript
const AZM_Audio_Configuration = {
  Settings: {                               // Description: The Settings node effects all audio processing by AZM
    Sample: {
      Size: 4,                              // DefaultValue: 4 || AcceptedValue: Integer || Description: Set the sample size for AZM Audio Collection
      Rate_In_Ms: 500                       // DefaultValue: 4 || AcceptedValue: 10-1000 || Description: Set the sample rate for AZM Audio Collection
    },
    GlobalThreshold: {
      Mode: 'On',                           // DefaultValue: 'On' || AcceptedValue: <'On', 'Off'> || Description: On: Enable Global Audio Thresholds for All Audio Zones; Off: Enable Independent Audio Thresholds for All Audio Zones
      High: 35,                             // DefaultValue: 35   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
      Low: 20                               // DefaultValue: 20   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
    }
  },
  Zones: [                                  // Description: The Zones object allows you to define one or more audio zones for the AZM Automation. This is an array.
    {
      Label: 'Zone 1',                      // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: '',                     // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            StreamName: '',                 // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4],            // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
            Id: 1                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec

          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomAsset_1: 'My First Asset',                 // NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        CameraId: 1                         // A more real world example of an Asset
      }
    }
  ]
}
```

#### AZM_Audio_Configuration.Settings.Sample.Size

> Description: The Sample Size refers to how many VuMeter samples the AZM Library connects across all microphone connectors before determining the Audio Zone's state

- **Default Value**: 4
- **Accepted Values**: Any non-negative, non-zero, whole integer
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: This value effects the performance and speed of the Audio Zone Status

#### AZM_Audio_Configuration.Settings.Sample.Rate

> Description: The Sample Rate refers to how often a VuMeter sampled by the AZM is collected in milliseconds across all microphone connectors

- **Default Value**: 500
- **Accepted Values**: 10 to 1000
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: This value effects the performance and speed of the Audio Zone Status

#### AZM_Audio_Configuration.Settings.GlobalThreshold.Mode

> Description: Choose how you want audio thresholds handled in your space

- **Default Value**: 'On'
- **Accepted Values**: ['On', 'Off']
- **DataType**: String
- **Required**: Yes
- **Value Definitions**:
  - On: Applies the **AZM_Audio_Configuration.Settings.GlobalThreshold.High/Low** values across all microphone connectors

#### AZM_Audio_Configuration.Settings.GlobalThreshold.High

> Description: The High threshold defined for all microphone connectors. Any Audio Zone that is greater than or equal too this value will transition to a _High_ state

- **Default Value**: 25
- **Accepted Values**: 1 to 60
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: The High threshold should have a value greater than the Low threshold

#### AZM_Audio_Configuration.Settings.GlobalThreshold.Low

> Description: The High threshold defined for all microphone connectors. Any Audio Zone that is lesser than or equal too this value will transition to a _Low_ state

- **Default Value**: 15
- **Accepted Values**: 1 to 60
- **DataType**: Integer
- **Required**: Yes
- **Value Definitions**:
  - NOTE: The Low threshold should have a value lesser than the High threshold

#### AZM_Audio_Configuration.Zones[{Array}]

> NOTE: The Zones nested values contains multiple blocks of similar properties. Below will cover all nested properties, but not all values belong to each connector type. You will need 4 Zones total for the Campfire Blueprint.

**Warning: It's best practice _NOT to mix Analog and Ethernet Microphones_ due to latency between the to microphone types. Please choose 1 microphone typw for your room design, follow the format for that microphone type listed below.**

##### AZM_Audio_Configuration.Zones[{Array}].Label

> Description: A label you can assign to the zone. This is used to identify zones in your space. 

- **Default Value**: 'Zone_N'
- **Accepted Values**: String
- **DataType**: String
- **Required**: No
- **Value Definitions**:
  - N/A

##### AZM_Audio_Configuration.Zones[{Array}].Independent_Threshold.High

> Description: The High threshold defined for the Zone it's defined within. Any Audio Zone that is greater than or equal too this value will transition to a _High_ state

- **Default Value**: 35
- **Accepted Values**: 1-60
- **DataType**: Integer
- **Required**: No
- **Value Definitions**:
  - NOTE: The High threshold should have a value greater than the Low threshold

##### AZM_Audio_Configuration.Zones[{Array}].Independent_Threshold.Low

> Description:  The Low threshold defined for the Zone it's defined within. Any Audio Zone that is greater than or equal too this value will transition to a _Low_ state

- **Default Value**: 20
- **Accepted Values**: 1-60
- **DataType**: Integer
- **Required**: No
- **Value Definitions**:
  - NOTE: The Low threshold should have a value lesser than the High threshold

##### AZM_Audio_Configuration.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Serial

> Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone. This tells the Macro how to find the Connector ID and map the correct audio information to your Zone

- **Default Value**: ''
- **Accepted Values**: String
- **DataType**: String
- **Required**: Only if using Cisco Ethernet Microphones
- **Value Definitions**:
  - N/A

##### AZM_Audio_Configuration.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].StreamName

> Description: For AES67 Microphones Only, assign the microphone's StreamName of the Microphone associated to this Zone.This tells the Macro how to find the Connector ID and map the correct audio information to your Zone

- **Default Value**: ''
- **Accepted Values**: String
- **DataType**: String
- **Required**: Only if using AES67 Ethernet Microphones
- **Value Definitions**:
  - N/A

##### AZM_Audio_Configuration.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].SubId

> Description: For Ethernet based Microphones, these are the SubIds (or media channels) to subscribe to. 3rd party microphones may vary in # of streams

- **Default Value**: []
- **Accepted Values**: [1-8] (Microphone Dependant)
- **DataType**: Integer Array
- **Required**: Only if using Ethernet based Microphones
- **Value Definitions**:
  - NOTE: Not all microphones have multiple SubIds. Many may mix the stream and output 1 channel

##### AZM_Audio_Configuration.Zones[{Array}].MicrophoneAssignment.Connectors[{SubArray}].Id

> Description: For Analog Microphones, assign the ConnectorId associated to the Zone. This is the physical connector id on the found on the codec body.

- **Default Value**: 1
- **Accepted Values**: 1-N
- **DataType**: Integer
- **Required**: Only if using Analog Microphones
- **Value Definitions**:
  - NOTE: Recommended to use Direction Analog Microphones

##### AZM_Audio_Configuration.Zones[{Array}].Assets

> Description: Assign unique objects under Assets to be assigned to this zone. This could contain any nest object for your design

- **Default Value**: {}
- **Accepted Values**: JSON Object Literal
- **DataType**: JSON Object Literal
- **Required**: No
- **Value Definitions**:
  - NOTE: Assets may change from project to project

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
- Required: Yes
- Parameters: event
- Sample Use and Event Callback

```javascript
AZM.Event.TrackZones.on(event => {
    console.log(event)
    //As the events Change a message will show on the OSD indicating the Zone State
    xapi.Command.UserInterface.Message.Alert.Display({
      Title: event.Zone.Label,
      Text: `ZoneId: [${event.Zone.Id}] state set to [${event.Zone.State}]<p>Asset: ${event.Assets.toString()}`
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
- Audio Zones with poorly defined audio separation in their pickup fields will produce false positives in your Audio Zone Automation

Below is an example image of Good Audio placement using the Cisco Table Microphone Pro (Image not to scale)
- Both Zones A and B have ample separation, thus producing reliable Audio Zone Automation

[<img src="/images/good_microphone_spacing.png" alt="Good Microphone Placement" width="300"/>](#)

Here is an example image of Poor Audio Placement (Image not to scale)
- Zone's A and B overlap at the center, so any information captured here could lean to either zone, resulting in poor Audio Zone Automation

[<img src="/images/poor_microphone_spacing.png" alt="Poor Microphone Placement" width="300"/>](#)

Here is an example image of Poor Placement, but with a better Audio Configuration applied to the AZM Configuration (Image not to scale)
- By only including SubIds 3 and 4 for both Microphones defined in Zone A and to only include SubIds 1 and 2 for both Microphones defined in Zone B you can still achieve good separation for reliable automation thus correcting this issue
- NOTE: Though the AZM Library is ignoring these SubIds for automation, the speech audio from all 4 microphones will still be mixed and sent into the call (unless configured otherwise)

[<img src="/images/poor_microphone_spacing_mitigated.png" alt="Poor Microphone Placement Mitigation" width="300"/>](#)

## TroubleShooting [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)
- AZM's base script has a few select logs to print to the console which has meaning for a live deployment
- However, there are additional logs you can enable in the AZM library itself you can use to troubleshoot a specific process, should you need too
- These logs need to be turned on in the AZM_Lib macro, starting on line 84

```javascript
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

<p align="center">
  [<img src="/images/macro-editor_severity_toggle.png" alt="Macro Editor Severity Dropdown" width="300"/>](#)
</p>

## Sample Use Cases [<img src="/images/view-list-circle_100_w.png" align="center" alt="table of contents" width="25"/>](#table-of-contents)
### Camera Automation
  - Leveraging the Zone States emitted by this script, you can:
    - Switch between different connectors as folks speak in different Audio Zones you define
    - Enable an extended Zoom Range for the base speakertracking solution provided by the codec
    
### Audio Ducking
  - Leveraging the Zone States emitted by this script, you can dynamically raise or lower Microphone input Gain in a space
  
### Screen Layout Automation
  - Leveraging the Zone States emitted by this script, you can alter the layouts of your screens as a speaker transitions between specific Audio Zones

## Tutorial Videos [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

- [Analog Microphone Configuration Guide](#)
  - Learn how to configure the AZM Library for use with Analog Microphones
- [Cisco Ethernet Microphone Configuration Guide](#)
  - Learn how to configure the AZM Library for use with Cisco Ethernet Microphones
- [AES67 Microphone Configuration Guide](#)
  - Learn how to configure the AZM Library for use with AES67 Microphones
- [AZM Macro Tutorial](#)
  - Learn how to make use of the AZM Functions to start building your own Macros
- [AZM in the Campfire Blueprint Macro](#)
  - A review on how the Campfire Blueprint Macros utilize the AZM Library

## FAQ [<img src="/images/view-list-circle_100_w.png" alt="table of contents" width="25"/>](#table-of-contents)

### Is this Macro Supported by Cisco TAC?
- No, all Macros are considered Custom Code by Cisco and are not supported.

### When does a Zone Change State?
- There are several rules in place to set the State of a Zone
- States
  - High: When at least 1 Audio ConnectorId, or SubId in the case of Ethernet Microphones, defined within a Zone moves to a High State. 
  - Low: When all Audio ConnectorIds, or SubIds, defined within a Zone move to a Low State
  - Unset: This only occurs on setup, when no audio data has been fed into the script. If at least 1 Audio ConnectorId, or SubIds, are Low or High, the Zone is no longer Unset

### Can I have multiple Zone configurations?
- Yes, I recommend you at least enable one at the start of the script, but you could have multiple Zone Configuration objects and can load a new object by recalling the AZM.Command.Zone.Setup(AZM_Audio_Configuration) function again in your script

### Can I run 2 different Audio solutions using AZM on the Same Codec?
- It's not recommended. AZM was not built for that application and when working with multiple audio solutions on a single codec, then it's best to keep the one solution defined under the same macro
- Though, you can define as many zones as you'd like, so you could in fact define a new zone with different assets and settings, but leverage the same microphone connectors should you need to

### How is the Audio data evaluated?
- The TrackZones Event Subscribes to the Audio VuMeter of your defined microphones
- This data is packaged into **```"bins"```** that are instantiated in an **```[X]_Bucket```** Class during the Zone Setup process
- These bins will fill up at a pace that's defined by both your **```Sample Size```** and **```Sample Rate```** value in the AudioConfiguration Object
- Once a bin matches the **```Sample Size```** value, the data collected is then Averaged and Compared against the **```High```** and **```Low```** thresholds set in the AudioConfiguration Object, then the bin is cleared for the next batch of data
- If the Average is equal to or above the **```High```** threshold, the connector associated to the incoming data is set to a **```High```** State
  - Else if the Average is equal to or above the **```Low```** threshold, the connector associated to the incoming data is set to a **```Low```** State
- The new Connector State is then passed up into the Zone Status, and further compared to the additional connector states within the Zone to determine the Zone State

### Can I edit this Macro?
- Of Course, it's an Open Script, feel free to fork and edit to your liking