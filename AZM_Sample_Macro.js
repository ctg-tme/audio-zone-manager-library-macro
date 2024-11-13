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
 *   - This is an Example Macro for the Audio Zone Manager Library (AZM_Lib)
 *   - This is NOT a full solution
 * 
 * Dependencies
 *   - AZM_Lib Macro installed on Device
 *   - AZM_Sample_Configuration Macro installed on Device
*/
/*
 * AZM Function List
 *
 *  Commands
 *    AZM.Command.Zone.Setup(AudioConfiguration)
 *      - Required. Run at on Script Initialization to apply Audio Configuration
 *    AZM.Command.Zone.Monitor.Start()
 *      - Starts VuMonitoring on configured Audio Inputs
 *    AZM.Command.Zone.Monitor.Stop()
 *      - Stops VuMonitoring on configured Audio Inputs
 *    AZM.Command.Zone.List();
 *      - Lists all AZM Zones Configured
 * 
 *  Statuses
 *    AZM.Status.Audio.Zone[ZoneId].get()
 *      - Get information on the targeted ZoneId
 *    AZM.Status.Audio.Zone[ZoneId].State.get()
 *      - Get State information on the targeted Zone Id
 * 
 * Events
 *    AZM.Event.TrackZones.on(event => ...)
 *      - Subscriptions to AZM Zone Events
 *      - Use this to monitor Zone State changes for your solution
*/

import xapi from 'xapi';
import { AZM } from './AZM_Lib';

// Example AZM Configurations
import {
  One_Analog_Mic_One_Zone,                      // Expects an Analog Mic Connected to Analog Input Connector 1
  Two_Analog_Mic_One_Zone,                      // Expects 2 Analog Mics Connected to Analog Input Connector 1 and 2
  Two_Analog_Mic_Two_Zone,                      // Expects 2 Analog Mics Connected to Analog Input Connector 1 and 2
  One_CiscoEthernet_Mic_One_Zone,               // Expects a Single Cisco Ethernet Mic Connected. You'll need to assign a Serial number for this mic in the AZM_Sample_Configurations macro file first
  Two_CiscoEthernet_Mic_One_Zone,               // Expects 2 Cisco Ethernet Mics Connected. You'll need to assign a Serial number for each mic in the AZM_Sample_Configurations macro file first
  Two_CiscoEthernet_Mic_Two_Zone,               // Expects 2 Cisco Ethernet Mics Connected. You'll need to assign a Serial number for each mic in the AZM_Sample_Configurations macro file first
  One_CiscoEthernet_Mic_SplitAcross_Two_Zone,   // Expects a Single Cisco Ethernet Mic Connected. You'll need to assign a Serial number for this mic in the AZM_Sample_Configurations macro file first
  One_AES67_Mic_One_Zone,                       // Expects a Single AES67 Mic Connected. You'll need to assign a Stream Name for this mic in the AZM_Sample_Configurations macro file first
  Two_AES67_Mic_One_Zone,                       // Expects 2 AES67 Mics Connected. You'll need to assign a Stream Name for each mic in the AZM_Sample_Configurations macro file first
  Two_AES67_Mic_Two_Zone,                       // Expects 2 AES67 Mics Connected. You'll need to assign a Stream Name for each mic in the AZM_Sample_Configurations macro file first
  One_USB_Mic_One_Zone,                         // Expects a single USB microphone connected to a USB A port. Cisco Codecs only support 1 USB Microphone source at a time
  One_ExternalVuMeter_Mic_One_Zone,             // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  Two_ExternalVuMeter_Mic_One_Zone,             // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  Two_ExternalVuMeter_Mic_Two_Zone,             // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  One_ExternalGate_Mic_One_Zone,                // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  Two_ExternalGate_Mic_One_Zone,                // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  Two_ExternalGate_Mic_Two_Zone,                // Requires external integration (room controller, ssh session, postman, service, etc). Check out the Postman Collection for example use. You'll need to configured a controller Id and Microphone Ids in the AZM_Sample_Configurations macro file first as you've defined them in your external controller
  All_Mic_Types_Separate_Zones,                 // Consider all Pre-requisites above prior to using
  Simple_AnalogMic_Camera_Example               // Expects 3 Analog Mics Connected to Analog Input Connector 1, 2 and 3. Expects 2 Cisco Cameras connected to HDMI Inputs 1 and 2. Expects Preset IDs 1, 2, 3 and 4 to exist on the codec
} from './AZM_Sample_Mic_Configurations'

/**
 * Choose one of the Example AZM Configurations above and assign this object to the ```configurationProfile``` object
 * 
 * NOTE: CiscoEthernet, AES67, ExternalVuMeter and ExternalFull need additional changes applied for full operation such as assigning Serial Numbers, Stream Names, Controller Settings Etc
 * 
 * Please review the Configuration Documentation -> [AZM Configuration](https://github.com/ctg-tme/audio-zone-manager-library-macro/tree/main?tab=readme-ov-file#azm-audio-configuration-)
 */
const configurationProfile = One_Analog_Mic_One_Zone;

function startAZMZoneListener() {
  AZM.Event.TrackZones.on(handleAZMZoneEvents);

  startAZMZoneListener = () => void 0;
}

function startCallListener() {
  //Subscribe to Call Status (For Demo Purposes)
  xapi.Status.SystemUnit.State.NumberOfActiveCalls.on(handleCallStatus)

  startCallListener = () => void 0;
}

async function handleAZMZoneEvents(event) {
  console.debug('Raw AZM Event Data ->', event)

  //Sample Log accessing different properties for a clean output
  console.log(`Audio Event Triggered. Zone [${event.Zone.Label}/${event.Zone.Id}] reported [${event.Zone.State == 'Low' ? ' Low' : event.Zone.State}]. Applying changes to the following assets`, event.Assets)

  //Pass this data into another process to start building your solution
  xapi.Command.UserInterface.Message.Prompt.Display({
    Title: `ZoneId: [${event.Zone.Id}] went [${event.Zone.State}]`,
    Text: `Zone: [${event.Zone.Label}] went [${event.Zone.State}].<p>It's average VuMeter Value: [${event.DataSet?.VuMeter?.Average}]`,
    "Option.1": `Asset: ${JSON.stringify(event.Assets)}`,
    Duration: 15
  })

  // If you're using the Simple_AnalogMic_Camera_Example configuration profile, then pass those camera assets into the proper camera APIs
  if ((event.Zone.Label == 'Left Side of Room' || event.Zone.Label == 'Right Side of Room') || event.Zone.Label == 'Middle of Room') {
    if (event.Zone.State == 'High') {
      for (const preset of event.Assets.Camera.PresetId) {
        await xapi.Command.Camera.Preset.Activate({ PresetId: preset });
      }
      await xapi.Command.Video.Input.SetMainVideoSource({
        ConnectorId: event.Assets.Camera.InputConnector,
        Layout: event.Assets.Camera.Layout
      });
    }
  }
}

async function handleCallStatus(event) {
  if (event > 0) {
    //Start the Zone VU Meters when a Call Starts
    AZM.Command.Zone.Monitor.Start()
  } else {
    //Stop the Zone VU Meters when a Call Ends
    AZM.Command.Zone.Monitor.Stop()
  }

  /*
    Why Stop the VuMeters?
      When VuMeters are Active, the Green Light on stock Cisco Microphones will light up
      This gives the user the impression they are being listened too, as the microphone looks active
      Stopping the VuMeters retains the Cisco Stock experience and shuts the LED off on the microphones
  */
}

async function init() {

  // Initialize your Audio Zones 
  await AZM.Command.Zone.Setup(configurationProfile);

  console.warn(AZM.Command.Zone.List())

  // Subscribe to AZM Zone Events
  startAZMZoneListener();

  startCallListener();

  await AZM.Command.Zone.Monitor.Stop();

  xapi.Command.UserInterface.Message.Prompt.Display({
    Title: `${_main_macro_name()} Started`,
    Text: 'Place this codec into a call, to enable the VuMeter and start listening to AZM Zone Events',
    Duration: 30
  });
}

init()