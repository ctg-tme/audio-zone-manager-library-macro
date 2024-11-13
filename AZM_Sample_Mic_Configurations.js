
/********************************************************
Copyright (c) 2024 Cisco and/or its affiliates.
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

 * Author(s):               [Your Name]
 *                          [Your Title]
 *                          [Your Organization]
 * 
 * Description:
 *   - Various examples for mic configurations for the AZM Library
 *   - Note, this is a Sample Macro, not a full solution
*/
/**
 * All AZM Setup Config Object have a Settings node and a Zones Node
 * - - -
 * To simplify the various examples, and to avoid unnecessary duplication we'll define the Settings Object Here and leverage the Spread Operator `...` to duplicate the below settings across all scenarios defined in this script
 */
const Settings = {                        // Description: The Settings node effects all audio processing by AZM
  Sample: {
    Size: 4,                              // DefaultValue: 4 || AcceptedValue: Integer || Description: Set the sample size for AZM Audio Collection
    Rate_In_Ms: 500,                      // DefaultValue: 4 || AcceptedValue: 10-1000 || Description: Set the sample rate for AZM Audio Collection
    Mode: 'Snapshot'                      // DefaultValue: Snapshot || AcceptedValue: <'Snapshot', 'Rolling'> || Description: Determine the profile in which Audio VuMeter data is evaluated.
  },
  GlobalThreshold: {
    Mode: 'On',                           // DefaultValue: 'On' || AcceptedValue: <'On', 'Off'> || Description: On: Enable Global Audio Thresholds for All Audio Zones; Off: Enable Independent Audio Thresholds for All Audio Zones
    High: 30,                             // DefaultValue: 35   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
    Low: 20                               // DefaultValue: 20   || AcceptedValue: 1-60          || Description: Set the High Global Threshold
  },
  VoiceActivityDetection: 'On'            // DefaultValue: 'On' || AcceptedValue: <'On', 'Off'> || Description: Use Voice Activity Detection to Re-Enforce High State transitions.
}

const One_Analog_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single Analog Mic in Zone 1',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
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
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_Analog_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Dual Analog Mics in Zone 1',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                 // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 1                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          },
          {
            Id: 2                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_Analog_Mic_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Analog Mic in Zone 1',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
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
        CustomObject: 'MyObject'
      }
    },
    {
      Label: 'Analog Mic in Zone 2',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                 // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 2                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'
      }
    }
  ]
}

const One_CiscoEthernet_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single Cisco Ethernet Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'XXXXXXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_CiscoEthernet_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Dual Ethernet Mics in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'XXXXXXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          },
          {
            Serial: 'YYYYYYYYYYY',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_CiscoEthernet_Mic_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Cisco Ethernet Mic Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'XXXXXXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    },
    {
      Label: 'Cisco Ethernet Mic Zone 2', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'YYYYYYYYYYY',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2, 3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'
      }
    }
  ]
}

const One_CiscoEthernet_Mic_SplitAcross_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single Cisco Mic, SubIds 1 & 2, Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'XXXXXXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [1, 2]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    },
    {
      Label: 'Single Cisco Mic, SubIds 3 & 4, Zone 2', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Ethernet',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Serial: 'XXXXXXXXXXX',            // DefaultValue: String || AcceptedValue: String || Description: For Cisco Ethernet Microphones Only, assign the microphone's Serial address of the Microphone associated to this Zone
            SubId: [3, 4]             // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'
      }
    }
  ]
}

const One_AES67_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single AES67 Mics in Zone 1',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'AES67',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'MicStreamName:1',  // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4, 5, 6, 7, 8] // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_AES67_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Dual AES67 Mics in Zone 1',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'AES67',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'MicStreamName:1',  // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4, 5, 6, 7, 8] // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          },
          {
            StreamName: 'MicStreamName:2',  // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4, 5, 6, 7, 8] // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const Two_AES67_Mic_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'AES67 Mic in Zone 1',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'AES67',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'MicStreamName:1',  // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4, 5, 6, 7, 8] // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    },
    {
      Label: 'AES67 Mic in Zone 2',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'AES67',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            StreamName: 'MicStreamName:2',  // DefaultValue: String || AcceptedValue: String || Description: For AES67 Microphones, assign the microphone's StreamName associated to the Zone
            SubId: [1, 2, 3, 4, 5, 6, 7, 8] // DefaultValue: Array  || AcceptedValue: [1-4]  || Description: SubIds to subscribe to
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'
      }
    }
  ]
}

const One_USB_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single USB Mic in Zone 1',  // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'USB',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'
      }
    }
  ]
}

const One_ExternalVuMeter_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single ExternalVuMeter Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0001',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalVuMeter',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const Two_ExternalVuMeter_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Dual ExternalVuMeter Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0001',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalVuMeter',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          },
          {
            Id: 2
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const Two_ExternalVuMeter_Mic_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'ExternalVuMeter Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0001',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalVuMeter',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    },
    {
      Label: 'Single ExternalVuMeter Mic in Zone 2', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0001',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalVuMeter',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 2
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const One_ExternalGate_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Single ExternalGate Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0002',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalGate',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const Two_ExternalGate_Mic_One_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'ExternalGate Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0002',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalGate',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          },
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const Two_ExternalGate_Mic_Two_Zone = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'ExternalGate Mic in Zone 1', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0002',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalGate',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 1
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyObject'                        // A more real world example of an Asset
      }
    },
    {
      Label: 'ExternalGate Mic in Zone 2', // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      ControllerId: '0002',
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                             // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'ExternalGate',                   // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [                       // Description: Assign one of more connectors to your Zone. This is an Array
          {
            Id: 2
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        CustomObject: 'MyOtherObject'                        // A more real world example of an Asset
      }
    }
  ]
}

const All_Mic_Types_Separate_Zones = {
  Settings: { ...Settings },
  Zones: [
    One_Analog_Mic_One_Zone.Zones[0],
    One_CiscoEthernet_Mic_One_Zone.Zones[0],
    One_AES67_Mic_One_Zone.Zones[0],
    One_USB_Mic_One_Zone.Zones[0],
    One_ExternalVuMeter_Mic_One_Zone.Zones[0],
    One_ExternalGate_Mic_One_Zone.Zones[0]
  ]
}

const Simple_AnalogMic_Camera_Example = {
  Settings: { ...Settings },
  Zones: [
    {
      Label: 'Left Side of Room',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
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
        Camera: {
          InputConnector: [1],
          PresetId: [1],
          Layout: 'Equal'
        }
      }
    },
    {
      Label: 'Right Side of Room',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                 // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 3                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        Camera: {
          InputConnector: [2],
          PresetId: [2],
          Layout: 'Equal'
        }
      }
    },
    {
      Label: 'Middle of Room',           // DefaultValue: 'Zone_N' || AcceptedValue: String || Description: Provide a label for your Audio Zone
      Independent_Threshold: {
        High: 35,                           // DefaultValue: 35 || AcceptedValue: 1-60 || Description: Set the High Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
        Low: 20                              // DefaultValue: 20 || AcceptedValue: 1-60 || Description: Set the Low Independent Threshold. Settings > Global > Threshold > Mode must be set to Off to access
      },
      MicrophoneAssignment: {
        Type: 'Microphone',                 // DefaultValue: 'Microphone' || AcceptedValue: <'Microphone' or 'Analog', 'Ethernet' or 'AES67'> || Description: Define the Type of Microphone placed in this Zone
        Connectors: [
          {
            Id: 2                           // DefaultValue: Integer || AcceptedValue: Integer || Description: For Analog Microphones, Assign the ConnectorId associated to the Zone. This ID corresponds to the physical input on the codec
          }
        ]
      },
      Assets: {                             // Description: Define any object associated to this Audio Zone. Asset Information will be provided when an Event Fires
        Camera: {
          InputConnector: [1, 2],
          PresetId: [3, 4],
          Layout: 'Equal'
        }
      }
    }
  ]
}

export {
  One_Analog_Mic_One_Zone,
  Two_Analog_Mic_One_Zone,
  Two_Analog_Mic_Two_Zone,
  One_CiscoEthernet_Mic_One_Zone,
  Two_CiscoEthernet_Mic_One_Zone,
  Two_CiscoEthernet_Mic_Two_Zone,
  One_CiscoEthernet_Mic_SplitAcross_Two_Zone,
  One_AES67_Mic_One_Zone,
  Two_AES67_Mic_One_Zone,
  Two_AES67_Mic_Two_Zone,
  One_USB_Mic_One_Zone,
  One_ExternalVuMeter_Mic_One_Zone,
  Two_ExternalVuMeter_Mic_One_Zone,
  Two_ExternalVuMeter_Mic_Two_Zone,
  One_ExternalGate_Mic_One_Zone,
  Two_ExternalGate_Mic_One_Zone,
  Two_ExternalGate_Mic_Two_Zone,
  All_Mic_Types_Separate_Zones,
  Simple_AnalogMic_Camera_Example
};