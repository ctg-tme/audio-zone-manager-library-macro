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
 *                          Technical Marketing Engineering, Techincal Leader
 *                          Cisco Systems
 *                          bomcgoni@cisco.com
 * 
 * Description:
 *   - This is an Example Macro for the Audio Zone Manager Library (AZM_Lib)
 * 
 * Dependencies
 *   - AZM_Lib Macro installed on Device
 *   - AZM_Sample_Configuration Macro installed on Device
*/

import xapi from 'xapi';
import { AZM_Audio_Configuration } from './AZM_Sample_Configuration';
import { AZM } from './AZM_Lib';

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

//Elements of AZM Must be run at the start of your Main Project
async function init() {
  // Run AZM Command Zone Setup and pass your AZM Configuration Object in as a parameter
  await AZM.Command.Zone.Setup(AZM_Audio_Configuration);

  //Subscribe to Call Status (For Demo Purposes)
  xapi.Status.SystemUnit.State.NumberOfActiveCalls.on(async event => {
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
        This gives the user the impression they are being listend too, as the microphone looks active
        Stopping the VuMeters retains the Cisco Stock experience and shuts the LED off on the microphones
    */
  })

  //Subscribe to AZM Event TrackZones
  //When the system is on call, data will begin to print to the console

  AZM.Event.TrackZones.on(event => {
    console.log(event)
    //As the events Change a message will show on the OSD indicating the Zone State
    xapi.Command.UserInterface.Message.Alert.Display({
      Title: event.Zone.Label,
      Text: `ZoneId: [${event.Zone.Id}] state set to [${event.Zone.State}]`
    })
  })
}

init()