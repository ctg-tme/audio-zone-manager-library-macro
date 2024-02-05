/********************************************************
Copyright (c) 2023 Cisco and/or its affiliates.
This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at
               https://developer.cisco.com/docs/licenses
All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*********************************************************

 * Author(s):               Robert(Bobby) McGonigle Jr
 *                          Technical Marketing Engineering, Technical Leader
 *                          Cisco Systems
 *                          bomcgoni@cisco.com
 * 
 * Description:
 *   - This is an Example Configuration Object for the Audio Zone Manager Library (AZM_Lib)
 *   - The AZM_Audio_Configuration must be defined in your project and passed into the AZM.Command.Zone.Setup(AudioConfiguration) function
 *   - This Macro File is setup to be imported into your Main Project, but does not required to be imported and can be copied into your Main Project
*/
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
      Label: 'Cisco Table Mic Pro Example', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'FOCXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomAsset_1: 'My First Asset',                 // NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        CameraId: 1                         // A more real world example of an Asset
      }
    },
    {
      Label: 'AES67 Mic Example',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'AES67',                      // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'streamName:16',    // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-8]  || Description: SubIds to subscribe to. 3rd party microphones may vary on quantity of SubIDs present on stream
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomAsset_2: 'Custom Asset 2',                 // NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        MonitorRole_1: 'Presentation'       // A more real world example of an Asset
      }
    },
    {
      Label: 'Analog Mic Config',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 15,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 9                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                 // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 1                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomAsset_3: 'Asset 3',                        // NOTE: Any Objects nested within Assets are defined by You and have no based key or value pairing. This us an example of a custom asset
        PresetId: 30                        // A more real world example of an Asset
      }
    }
  ]
}

/*
  Exporting the configuration to another Macro is not required, but does enable better readability
  You can feel free to instantiate this object in your main project
*/
export {
  AZM_Audio_Configuration
};
