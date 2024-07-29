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
 * 
 * Consulting Engineer(s)   Gerardo Chaves                    William Mills
 *                          Leader, Systems Engineering       Technical Solutions Specialist
 *                          Cisco Systems                     Cisco Systems
 * 
 * Description:
 *   - Audio Zone Manager (AZM)
 *   - Suite of custom Commands, Statuses and Events that have been
 *     tailored to enable Audio Based Automations
 *   - This Library is intended to be imported into a Project
 * 
 *   - Dependencies
 *     - The Device xAPI
 *     - Audio Configuration Object (Refer to AZM Guide)
 * 
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
import xapi from 'xapi';

/* 
  When set to true, will ensure all Ethernet SubId Arrays coming
    from xEvent Audio Input Connectors Ethernet contain 8 channels 
    of media information data
  
  The last know value of the target SubId is re-applied to the object
    before processing the payload
  
  If no data was previously capture, it assumes 0 for VuMeter, 
    PPMeter, NoiseLevel and LoudSpeakerActivity as the previous value 
    until new information comes in
  
  This allows for all audio within a zone to be evaluated synchronously

  When set to false, the data is not manipulated and Audio Data will 
    be evaluated asynchronously
*/
const config_settings_NormalizeEthernetSubIdPayload = true;

/**
 * Set the Mode for AZM Automatic Updates
 * 
 * Periodically reaches out to github to check for updates to the AZM_Lib.
 * 
 * @value off(default): disables automatic update checks to AZM Library
 * @value monitor: If available, will log update details to the console and provides a UI element in the Control Panel notifying the user.
 * 
 * @link [Audio Zone Manager Releases](https://github.com/ctg-tme/audio-zone-manager-library-macro/releases)
 * 
 * @see config_AutomaticUpdates_Schedule_Day
 * @see config_AutomaticUpdates_Schedule_Time
 */
const config_AutomaticUpdates_Mode = 'monitor';

/**
 * Set the Day to check for AZM Updates
 * 
 * @value String - Acceped Values: "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
 * @see config_AutomaticUpdates_Schedule_Time
 */
const config_AutomaticUpdates_Schedule_Day = 'Sunday';
/**
 * Set the Time to check for AZM Updates
 * 
 * @value String - Acceped Value: 24hr Format String. Ex: 00:00
 * @see config_AutomaticUpdates_Schedule_Day
 */
const config_AutomaticUpdates_Schedule_Time = '05:00';

/* 
  The following configuration items allows us to isolate areas of 
    interest in the console log when troubleshooting
*/
const config_settings_DebugUtil_SetupDbug = false;
const config_settings_DebugUtil_StartStopMonitorDbug = false;
const config_settings_DebugUtil_RawAudioData = false;
const config_settings_DebugUtil_ZoneDbug = false;
const config_settings_DebugUtil_EthernetBucketDbug = false;
const config_settings_DebugUtil_AnalogBucketDbug = false;
const config_settings_DebugUtil_AdvancedDbug = false;

/* 
  Alternative Includes prototype that replaces
  the Strict Equality operator (===) with the
  Equality Operator (==)
*/
Array.prototype.includish = function (value) {
  for (let i = 0; i < this.length; i++) {
    if (this[i] == value) {
      return true;
    }
  }
  return false;
};

/* 
  Enables a Clean Cloning of an Object without
  altering the original object
*/
Object.prototype.clone = Array.prototype.clone = function () {
  if (Object.prototype.toString.call(this) === '[object Array]') {
    var clone = [];
    for (var i = 0; i < this.length; i++) {
      clone[i] = this[i].clone();
    }
    return clone;
  } else if (typeof (this) == "object") {
    var clone = {};
    for (var prop in this)
      if (this.hasOwnProperty(prop)) {
        clone[prop] = this[prop].clone();
      }
    return clone;
  }
  else {
    return this;
  }
}

/**
 * The Installed Version of AZM
 * 
 * Do NOT alter this value, as it could impact the operation fo the Macro
 */
const version = '0.8.0'

/**
 * Checks the OS of the device to see validate minimum requirements
 * 
 * on the device or not
 * @parameter { String } minimumOs - Numeric RoomOS Number seperated by dots (EX: 11.1.1.0)
 * @returns boolean
 */
async function check4_Minimum_Version_Required(minimumOs) {
  const reg = /^\D*(?<MAJOR>\d*)\.(?<MINOR>\d*)\.(?<EXTRAVERSION>\d*)\.(?<BUILDID>\d*).*$/i;
  const minOs = minimumOs;
  const os = await xapi.Status.SystemUnit.Software.Version.get();
  const x = (reg.exec(os)).groups;
  const y = (reg.exec(minOs)).groups;
  if (parseInt(x.MAJOR) > parseInt(y.MAJOR)) return true;
  if (parseInt(x.MAJOR) < parseInt(y.MAJOR)) return false;
  if (parseInt(x.MINOR) > parseInt(y.MINOR)) return true;
  if (parseInt(x.MINOR) < parseInt(y.MINOR)) return false;
  if (parseInt(x.EXTRAVERSION) > parseInt(y.EXTRAVERSION)) return true;
  if (parseInt(x.EXTRAVERSION) < parseInt(y.EXTRAVERSION)) return false;
  if (parseInt(x.BUILDID) > parseInt(y.BUILDID)) return true;
  if (parseInt(x.BUILDID) < parseInt(y.BUILDID)) return false;
  return false;
}

function Schedule(timeOfDay = '00:00', day, callBack) {
  const dayToNumber = { "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6, "sunday": 7 };

  const [configuredHour, configuredMinute] = timeOfDay.replace('.', ':').split(':');

  const now = new Date();
  const thisDay = now.getDay();

  const parseNow = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  let difference = parseInt(configuredHour) * 3600 + parseInt(configuredMinute) * 60 - parseNow;
  if (difference <= 0) {
    difference += 24 * 3600
  };
  return setTimeout(function () {
    if (thisDay == dayToNumber[day.toLowerCase()]) {
      const message = { Message: `[${timeOfDay}] Scheduled event fired` }
      callBack(message)
    }
    setTimeout(function () {
      Schedule(timeOfDay, day, callBack)
    }, 1000)
  }, difference * 1000);
}

const automaticUpdates = {
  CompareAZMVersion: function (currentVersion, incomingVersion) {
    const parseVersion = (version) => version.split('.').map(Number);

    const [currentMajor, currentMinor, currentBuild] = parseVersion(currentVersion);
    const [incomingMajor, incomingMinor, incomingBuild] = parseVersion(incomingVersion);

    if (incomingMajor > currentMajor) {
      return "Higher";
    } else if (incomingMajor < currentMajor) {
      return "Lower";
    } else if (incomingMinor > currentMinor) {
      return "Higher";
    } else if (incomingMinor < currentMinor) {
      return "Lower";
    } else if (incomingBuild > currentBuild) {
      return "Higher";
    } else if (incomingBuild < currentBuild) {
      return "Lower";
    } else {
      return "Match";
    }
  },
  GetReleaseLocationUrl: function (headers) {
    const locationHeader = headers.find(header => header.Key === 'location');

    return locationHeader ? locationHeader.Value : null;
  },
  StartUpdateProcess: async function () {

    if (config_AutomaticUpdates_Mode.toLowerCase() == 'off') {
      await removeAZMNotifications()
      return;
    } else {
      await buildAZMNotifications();
      await updateAZMUpdateStatusUIExtension(`Checking for AZM File Updates...`, '- - -');
    }

    let newAZMMacro = undefined;

    let manifest = {};

    let releaseFileUrl = {
      AZM_Lib: '',
      manifest: ''
    }

    // First get latest release information from github
    // Parse the indformation to grab the download URLs for both the AZM Lib and Manifest
    try {
      const requestRelease = await xapi.Command.HttpClient.Get({
        Url: `https://api.github.com/repos/ctg-tme/audio-zone-manager-library-macro/releases/latest`
      })

      const releaseManifest = JSON.parse(requestRelease.Body);

      releaseManifest.assets.forEach(item => {
        // Check the name of the asset and assign the URL accordingly
        switch (item.name) {
          case 'AZM_Lib.js':
            releaseFileUrl.AZM_Lib = item.browser_download_url;
            break;
          case 'manifest.json':
            releaseFileUrl.manifest = item.browser_download_url;
            break;
          default:
            break;
        }
      });
    } catch (e) {
      await updateAZMUpdateStatusUIExtension(`Uh-Oh! Unable to reach Github. Installed Version: v${version}. Check the Macro Console for more information`, '- - -');
      let err = {
        Context: `Unable to fetch intial releases URL`,
        ...e
      }
      console.AZM.warn(err)
    }

    // Then use the manifest Download Link to get the source information into a buffer
    // Parse the JSON in this file and validate the AZM Version against the Macro, the RoomOS Version against the Device and check for MTR compatibilty
    try {
      let request = await xapi.Command.HttpClient.Get({ Url: releaseFileUrl.manifest });
    } catch (e) {
      if (parseInt(e.data.StatusCode) == 302) {
        const rawFileUrl = automaticUpdates.GetReleaseLocationUrl(e.data.Headers)
        const subRequest = await xapi.Command.HttpClient.Get({
          Url: rawFileUrl
        })
        manifest = JSON.parse(subRequest.Body)
      } else {
        await updateAZMUpdateStatusUIExtension(`Uh-Oh! Unable to reach Github. Installed Version: v${version}. Check the Macro Console for more information`, '- - -');
        let err = {
        Context: `Unable to fetch manifest URL`,
        ...e
      }
      console.AZM.warn(err)
      }
    }

    const isNewAZMVersionAvailable = automaticUpdates.CompareAZMVersion(version, manifest.version)
    const isRoomOSVersionCompatible = await check4_Minimum_Version_Required(manifest.roomos)

    if (!isRoomOSVersionCompatible) {
      let msg = `Unable to install new AZM Update. New AZM version [${manifest.version}] requires RoomOS version [${manifest.roomos}] or newer`
      await updateAZMUpdateStatusUIExtension(msg, manifest.description);
      return
    }

    switch (isNewAZMVersionAvailable) {
      case 'Higher':
        switch (config_AutomaticUpdates_Mode.toLowerCase()) {
          // case 'on':
          //   /*
          //   Fun Fact :) By mimicking the process above, you can reach out and download a copy of the new AZM Release and append it to a variable
          //   Then using the following xAPI Commands
          //   - [xCommand Macros Macro Save](https://roomos.cisco.com/xapi/Command.Macros.Macro.Save/)
          //   - [xCommand Macros Macro Activate](https://roomos.cisco.com/xapi/Command.Macros.Macro.Activate/)
          //   - [xCommand Macros Runtime Restart](https://roomos.cisco.com/xapi/Command.Macros.Runtime.Restart/)

          //   You can automatically install the latest release directly from Github!

          //   Just be sure to parse the config that exists in the running version of AZM and merge that into the downloaded copy
          //   */
          //   break;
          case 'monitor': default:
            await buildAZMNotifications();
            let msg = `AZM Update Avalaible. Installed Version: v${version} || New Version v${manifest.version}. Go to the AZM Github to grab a copy.`
            await updateAZMUpdateStatusUIExtension(msg, manifest.description);
            console.AZM.info(`View the AZM Release -> https://github.com/ctg-tme/audio-zone-manager-library-macro/releases`)
            console.AZM.info(`Download the Latest AZM Release -> ${releaseFileUrl.AZM_Lib}`)
            break;
        }
        break;
      case 'Lower':
        updateAZMUpdateStatusUIExtension(`Installed Version [v${version}] is greater than the one available on github [v${manifest.version}]`, `No Description Available (You might be running an unreleased version or a fork)`);
        break;
      case 'Match':
        await updateAZMUpdateStatusUIExtension(`Installed Version: v${version}. You're up to date!`, manifest.description);
        break;
    }
  }
}

const azmnotifyPanelId = 'azm_notify';

async function buildAZMNotifications(manualButton = false/*Not Implemented*/) {
  const xml = `<Extensions>
  <Panel>
    <Order>99</Order>
    <Location>ControlPanel</Location>
    <Icon>Microphone</Icon>
    <Name>Audio Zone Manager Notifications</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>AZM Notifications</Name>
      <Row>
        <Name>Update Status</Name>
        <Widget>
          <WidgetId>azm_notify~notifications~UpdateStatus</WidgetId>
          <Name>Installed Version: v${version}</Name>
          <Type>Text</Type>
          <Options>size=4;fontSize=small;align=left</Options>
        </Widget>
        ${manualButton ? `<Widget>
          <WidgetId>azm_notify~notifications~ManualUpdate</WidgetId>
          <Name>Manual Update</Name>
          <Type>Button</Type>
          <Options>size=2</Options>
        </Widget>` : ''}
      </Row>
      <Row>
        <Name>Update Description</Name>
        <Widget>
          <WidgetId>azm_notify~notifications~UpdateDescription</WidgetId>
          <Name>- - -</Name>
          <Type>Text</Type>
          <Options>size=4;fontSize=small;align=left</Options>
        </Widget>
      </Row>
      <PageId>azm_notify~notifications</PageId>
      <Options/>
    </Page>
  </Panel>
</Extensions>`
  await xapi.Command.UserInterface.Extensions.Panel.Save({ PanelId: azmnotifyPanelId }, xml)
}

async function removeAZMNotifications() {
  await xapi.Command.UserInterface.Extensions.Panel.Remove({ PanelId: azmnotifyPanelId }).catch(e => e)
}

async function updateAZMUpdateStatusUIExtension(status = '...', description) {
  console.AZM.warn(status);

  await xapi.Command.UserInterface.Extensions.Widget.SetValue({
    WidgetId: 'azm_notify~notifications~UpdateStatus',
    Value: status
  })

  await xapi.Command.UserInterface.Extensions.Widget.SetValue({
    WidgetId: 'azm_notify~notifications~UpdateDescription',
    Value: description
  })
}

/* 
  Instantiate AZM Object, later exported
  Mimicking xAPI Path structure, to allow faster learning and improve readability
*/
const AZM = {
  Command: {
    Zone: {
      Setup: {},
      Monitor: {}
    }
  },
  Status: {
    Audio: {
      Connector: {},
      Zone: {}
    }
  },
  Event: {
    TrackZones: {}
  }
};

/* 
  Setup AZM Log References
  These are used to isolate areas of interest when troubleshooting
*/
console.AZM = {}

console.AZM.log = function (...args) { let arr = []; args.forEach((element, index) => { arr.push(element); }); console.log({ AZM_Log: arr }); }
console.AZM.info = function (...args) { let arr = []; args.forEach((element, index) => { arr.push(element); }); console.info({ AZM_Info: arr }); }
console.AZM.warn = function (...args) { let arr = []; args.forEach((element, index) => { arr.push(element); }); console.warn({ AZM_Warn: arr }); }

console.AZM.SetupDebug = function (...args) { if (config_settings_DebugUtil_SetupDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_SetupDebug: arr }); }; }
console.AZM.MonitorDebug = function (...args) { if (config_settings_DebugUtil_StartStopMonitorDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_MonitorDebug: arr }); }; }
console.AZM.AudioDataDebug = function (...args) { if (config_settings_DebugUtil_RawAudioData) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_AudioDataDebug: arr }); }; }
console.AZM.ZoneDebug = function (...args) { if (config_settings_DebugUtil_ZoneDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_ZoneDebug: arr }); }; }
console.AZM.E_BucketDebug = function (...args) { if (config_settings_DebugUtil_EthernetBucketDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_EthernetBucketDebug: arr }); }; }
console.AZM.A_BucketDebug = function (...args) { if (config_settings_DebugUtil_AnalogBucketDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_AnalogBucketDebug: arr }); }; }
console.AZM.AdvDebug = function (...args) { if (config_settings_DebugUtil_AdvancedDbug) { let arr = []; args.forEach(element => { arr.push(element); }); console.debug({ AZM_AdvDebug: arr }); }; }

/* 
  Object used to capture/clone Audio Configuration for AZM
*/
let AudioConfiguration = {};

/* 
  Zone Class
  This tracks the Zone State based on it's Connector States
  This Class is instantiated in AZM.Status.Audio.Zone[N]
    - This path allows a developer to poll the current state of a specific Zone
*/
class Zone_Tracker {
  constructor(zoneId, zoneLabel, zoneType, assets) {
    this._ZoneId = zoneId;
    this._Label = zoneLabel;
    this._Connectors = [];
    this._State = 'Unset';
    this._ZoneType = zoneType;
    this._Assets = assets;
    console.AZM.ZoneDebug(`New [${this._ZoneType}] Zone instantiated || ZoneId: [${this._ZoneId}]`)
  }
  addConnector(connectorId, state, zoneId) {
    if (zoneId == this._ZoneId) {
      this._Connectors.push({ ConnectorId: connectorId, State: state })
      console.AZM.ZoneDebug(`ConnectorId [${connectorId}] added || ZoneId: [${this._ZoneId}]`)
    }
  }
  setConnectorState(connectorId, newState, zoneId) {
    checkZoneSetup(`Unable to set connector state on ZoneId: [${this._ZoneId}]`)
    if (zoneId == this._ZoneId) {
      const index = this._Connectors.findIndex(item => item.ConnectorId === connectorId);

      if (index !== -1) {
        this._Connectors[index].State = newState;
        console.AZM.ZoneDebug(`ConnectorId [${connectorId}] State updated to [${newState}] || ZoneId: [${this._ZoneId}]`)
      }
    }
  }
  get State() {
    checkZoneSetup(`Unable to request Zone information from ZoneId: [${this._ZoneId}]`)
    let hasHigh = false;
    let hasLow = false;
    let hasUnset = false;

    for (const item of this._Connectors) {
      if (item.State == 'High') {
        hasHigh = true;
      } else if (item.State == 'Low') {
        hasLow = true;
      } else if (item.State == 'Unset') {
        hasUnset = true;
      }
    }

    const stateObject = {
      get: () => {
        if (hasHigh) {
          return 'High';
        } else if (hasLow && !hasUnset) {
          return 'Low';
        } else if (!hasLow && hasUnset) {
          return 'Unset';
        } else {
          return 'Low';
        }
      },
    };
    this._State = stateObject
    console.AZM.ZoneDebug(`Zone State Get Requested || ZoneId: [${this._ZoneId}]`)
    return stateObject;
  }

  get() {
    checkZoneSetup(`Unable to request Zone information from ZoneId: [${this._ZoneId}]`)
    this._State = this.State.get()
    console.AZM.ZoneDebug(`Zone Get Requested || ZoneId: [${this._ZoneId}]`)
    return { Id: this._ZoneId, Label: this._Label, Connectors: this._Connectors, State: this._State }
  }
}

/* 
  Object to Store Audio Connector Data, later instantiated by their respective _Bucket Classes
*/
let AudioBucket = { Ethernet: {}, Analog: {}, USB: {} }

/* 
  This class tracks and processes incoming Ethernet Audio Data per Connector
  It's instantiated in the AudioBucket Object
  The run Method is called Later when the Audio Connector Event is subscribed too
  It will collect all information until a Max Setting, then process the data for
    the AZMe.Event.TrackZones subscription
*/
class Ethernet_Bucket {
  constructor(connectorId, connectorSubId, zoneId, zoneLabel, assets) {
    this.ConnectorId = connectorId;
    this.ConnectorSubIds = connectorSubId;
    this.ZoneId = zoneId;
    this.Label = zoneLabel;
    this.Assets = assets;
    this.State = 'Unset';  //High, Low, Unset
    this.SubStates = {}
    this.bin = this.setSubIdProperties();
    this.thresholds = this.setAudioThresholds()
    console.AZM.E_BucketDebug(`New [Ethernet] Bucket instantiated || Bucket: [Connector: ${this.ConnectorId}, SubId: ${this.ConnectorSubIds}] || ZoneId: [${this.ZoneId}]`)
  }
  setSubIdProperties() {
    const initialBins = {};
    let binCount = 0
    this.ConnectorSubIds.forEach(element => {
      binCount++
      //Based on configured SubIds, instantiate bins to collect audio data
      initialBins[element] = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] };
      //Also instantiate substates, for Connector State evaluation
      this.SubStates[element] = 'Unset';
    });
    console.AZM.E_BucketDebug(`[${binCount}] [Ethernet] Bucket bins created || Bucket: [Connector: ${this.ConnectorId}, SubId: ${this.ConnectorSubIds}] || ZoneId: [${this.ZoneId}]`)
    return initialBins;
  }

  //Determine which threshold to abide by, based on the Audio Configuration
  setAudioThresholds() {
    let lowThresh;
    let highThresh;

    if (AudioConfiguration.Settings.GlobalThreshold.Mode.toLowerCase() == 'on') {
      lowThresh = AudioConfiguration.Settings.GlobalThreshold.Low.clone()
      highThresh = AudioConfiguration.Settings.GlobalThreshold.High.clone()
      console.AZM.E_BucketDebug(`Global Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
      return { High: highThresh, Low: lowThresh }
    }

    if (parseInt(AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low) > 0 || parseInt(AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High) > 0) {
      lowThresh = AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low.clone()
      highThresh = AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High.clone()
      console.AZM.E_BucketDebug(`Independent Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
      return { High: highThresh, Low: lowThresh }
    }

    if (AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High == undefined || AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low == undefined) {
      if (AudioConfiguration.Settings.GlobalThreshold.Low != undefined || AudioConfiguration.Settings.GlobalThreshold.High != undefined) {
        lowThresh = AudioConfiguration.Settings.GlobalThreshold.Low.clone()
        highThresh = AudioConfiguration.Settings.GlobalThreshold.High.clone()
        console.AZM.E_BucketDebug(`Independent Threshold no found, reverting to Global Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
        return { High: highThresh, Low: lowThresh }
      } else {
        throw Error(JSON.stringify({ message: `High and Low Thresholds not defined on [Ethernet] bucket`, ZoneId: this.ZoneId, Connector: this.ConnectorId, SubId: this.ConnectorSubIds, Tip: `Review the AudioMap configuration` }))
      }
    }

    throw Error(JSON.stringify({ message: `Unable to set Audio Thresholds on [Ethernet] bucket`, ZoneId: this.ZoneId, Connector: this.ConnectorId, SubId: this.ConnectorSubIds, Tip: `Review the AudioMap configuration` }))
  }

  run(data, callback) {
    data.SubId.forEach(subElement => {
      if (this.ConnectorSubIds.includish(subElement.id)) {
        this.bin[subElement.id].VuMeter.push(subElement.VuMeter);
        this.bin[subElement.id].PPMeter.push(subElement.PPMeter);
        this.bin[subElement.id].NoiseLevel.push(subElement.NoiseLevel);
        this.bin[subElement.id].LoudspeakerActivity.push(subElement.LoudspeakerActivity);
        console.AZM.E_BucketDebug(`Ethernet SubId [${subElement.id}] payload pushed into bins || ZoneId: [${this.ZoneId}] || Bucketlength: [${this.bin[subElement.id].VuMeter.length}]`)
        if (this.bin[subElement.id].VuMeter.length == AudioConfiguration.Settings.Sample.Size) {
          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet SubId [${subElement.id}] met Sample Size [${AudioConfiguration.Settings.Sample.Size}], processing bin || ZoneId: [${this.ZoneId}]`)

          const process_vu_meter = Process_BIN_Data(this.bin[subElement.id].VuMeter)
          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet SubId [${subElement.id}] processed. Result [${JSON.stringify(process_vu_meter)}] || ZoneId: [${this.ZoneId}]`)

          this.bin[subElement.id] = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] };
          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet SubId [${subElement.id}] cleared || ZoneId: [${this.ZoneId}]`)

          //Compare Average VU against Threshold and set SubId state
          if (process_vu_meter.Average >= this.thresholds.High) {
            this.SubStates[subElement.id] = 'High'
          } else if (process_vu_meter.Average <= this.thresholds.Low) {
            this.SubStates[subElement.id] = 'Low'
          } else {
            //May implement a Middle state in the future?
            //Perhaps an ExitHigh or ExitLow callback?
            //this.SubStates[subElement.id] = 'Middle'
          }
          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet SubId [${subElement.id}] State set [${this.SubStates[subElement.id]}] || ZoneId: [${this.ZoneId}]`)

          //Check all SubId States, and set Connector State
          let hasHigh = false;
          let hasLow = false;
          let hasUnset = false;

          for (const item of this.ConnectorSubIds) {
            if (this.SubStates[item] == 'High') {
              hasHigh = true;
            } else if (this.SubStates[item] == 'Low') {
              hasLow = true;
            } else if (this.SubStates[item] == 'Unset') {
              hasUnset = true;
            }
          }

          if (hasHigh) {
            this.State = 'High';
          } else if (hasLow && !hasUnset) {
            this.State = 'Low';
          } else if (!hasLow && hasUnset) {
            this.State = 'Unset';
          } else {
            this.State = 'Low';
          }
          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet ConnectorId [${this.ConnectorId}] State set [${this.State}] || ZoneId: [${this.ZoneId}]`)

          //Update Zone Connector with current Value
          AZM.Status.Audio.Zone[this.ZoneId].setConnectorState(this.ConnectorId, this.State, this.ZoneId)

          const payload = {
            Zone: {
              Label: this.Label,
              State: AZM.Status.Audio.Zone[this.ZoneId].State.get(),
              Id: this.ZoneId
            }, Connector: {
              Type: 'Ethernet',
              State: this.State,
              Id: this.ConnectorId, SubId: subElement.id
            }, Assets: this.Assets,
            DataSet: { VuMeter: process_vu_meter }
          }

          console.AZM.E_BucketDebug(`VuMeter Bin Ethernet ConnectorId [${this.ConnectorId}] Callback Fired || ZoneId: [${this.ZoneId}]`)
          callback(payload)
        }
      }
    });
  }
}

/* 
  This class tracks and processes incoming Analog(Microphone) Audio Data per Connector
  It's instantiated in the AudioBucket Object
  The run Method is called Later when the Audio Connector Event is subscribed too
  It will collect all information until a Max Setting, then process the data for
    the AZMe.Event.TrackZones subscription
*/
class Analog_Bucket {
  constructor(connectorId, zoneId, zoneLabel, assets) {
    this.ConnectorId = connectorId;
    this.ZoneId = zoneId;
    this.Label = zoneLabel;
    this.Assets = assets;
    this.State = 'Unset';  //High, Low, Unset
    this.bin = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] }
    this.thresholds = this.setAudioThresholds()
    console.AZM.A_BucketDebug(`New [Analog] Bucket instantiated || Bucket: [Connector: ${this.ConnectorId} || ZoneId: [${this.ZoneId}]`)
  }
  setAudioThresholds() {
    let lowThresh;
    let highThresh;

    if (AudioConfiguration.Settings.GlobalThreshold.Mode.toLowerCase() == 'on') {
      lowThresh = AudioConfiguration.Settings.GlobalThreshold.Low.clone()
      highThresh = AudioConfiguration.Settings.GlobalThreshold.High.clone()
      console.AZM.A_BucketDebug(`Global Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
      return { High: highThresh, Low: lowThresh }
    }

    if (parseInt(AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low) > 0 || parseInt(AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High) > 0) {
      lowThresh = AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low.clone()
      highThresh = AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High.clone()
      console.AZM.A_BucketDebug(`Independent Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
      return { High: highThresh, Low: lowThresh }
    }

    if (AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.High == undefined || AudioConfiguration.Zones[this.ZoneId - 1].Independent_Threshold.Low == undefined) {
      if (AudioConfiguration.Settings.GlobalThreshold.Low != undefined || AudioConfiguration.Settings.GlobalThreshold.High != undefined) {
        lowThresh = AudioConfiguration.Settings.GlobalThreshold.Low.clone()
        highThresh = AudioConfiguration.Settings.GlobalThreshold.High.clone()
        console.AZM.A_BucketDebug(`Independent Threshold no found, reverting to Global Threshold set on ZoneId [${this.ZoneId}] || Thresholds >> High [${highThresh}] || Low [${lowThresh}]`)
        return { High: highThresh, Low: lowThresh }
      } else {
        throw Error(JSON.stringify({ message: `High and Low Thresholds not defined on [Analog] bucket`, ZoneId: this.ZoneId, Connector: this.ConnectorId, SubId: this.ConnectorSubIds, Tip: `Review the AudioMap configuration` }))
      }
    }

    throw Error(JSON.stringify({ message: `Unable to set Audio Thresholds on [Analog] bucket`, ZoneId: this.ZoneId, Connector: this.ConnectorId, SubId: this.ConnectorSubIds, Tip: `Review the AudioMap configuration` }))
  }
  run(data, callback) {
    this.bin.VuMeter.push(data.VuMeter)
    this.bin.PPMeter.push(data.PPMeter)
    this.bin.NoiseLevel.push(data.NoiseLevel)
    this.bin.LoudspeakerActivity.push(data.LoudspeakerActivity)
    console.AZM.A_BucketDebug(`Analog ConnectorId [${this.ConnectorId}] payload pushed into bins || ZoneId: [${this.ZoneId}] || Bucketlength: [${this.bin.VuMeter.length}]`)
    if (this.bin.VuMeter.length == AudioConfiguration.Settings.Sample.Size) {
      const process_vu_meter = Process_BIN_Data(this.bin.VuMeter)
      console.AZM.A_BucketDebug(`VuMeter Bin Analog ConnectorId [${this.ConnectorId}] met Sample Size [${AudioConfiguration.Settings.Sample.Size}], processing bin || ZoneId: [${this.ZoneId}]`)

      this.bin = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] }
      console.AZM.A_BucketDebug(`VuMeter Bin Analog ConnectorId [${this.ConnectorId}] cleared || ZoneId: [${this.ZoneId}]`)

      if (process_vu_meter.Average >= this.thresholds.High) {
        this.State = 'High'
      } else if (process_vu_meter.Average <= this.thresholds.Low) {
        this.State = 'Low'
      } else {
        //May implement a Middle state in the future?
        //Perhaps an ExitHigh or ExitLow callback?
        //this.SubStates[subElement.id] = 'Middle'
      }
      console.AZM.A_BucketDebug(`VuMeter Bin Analog ConnectorId [${this.ConnectorId}] State set [${this.State}] || ZoneId: [${this.ZoneId}]`)

      AZM.Status.Audio.Zone[this.ZoneId].setConnectorState(this.ConnectorId, this.State, this.ZoneId)

      const payload = {
        Zone: {
          Label: this.Label,
          State: AZM.Status.Audio.Zone[this.ZoneId].State.get(),
          Id: this.ZoneId
        }, Connector: {
          Type: 'Analog',
          State: this.State,
          Id: this.ConnectorId
        }, Assets: this.Assets,
        DataSet: { VuMeter: process_vu_meter }
      }
      console.AZM.A_BucketDebug(`VuMeter Bin Analog ConnectorId [${this.ConnectorId}] Callback Fired || ZoneId: [${this.ZoneId}]`)
      callback(payload);
    }
  }
}

/* 
  This class tracks and processes incoming USB Audio Data per Connector
  It's instantiated in the AudioBucket Object
  The run Method is called Later when the Audio Connector Event is subscribed too
  It will collect all information until a Max Setting, then process the data for
    the AZMe.Event.TrackZones subscription
*/
class USB_Bucket {
  constructor(inputID, type) {
    this.id = inputID
    this.type = type
    this.lastKnownState = {
      VuMeter: 'N/A',
      PPMeter: 'N/A',
      NoiseLevel: 'N/A',
      LoudspeakerActivity: 'N/A'
    }
    this.bin = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] }
  }
  run(data, callback) {
    this.bin.VuMeter.push(data.VuMeter)
    if (this.bin.VuMeter.length == AudioConfiguration.Settings.Sample.Size) {
      const vumeter = Process_BIN_Data(this.bin.VuMeter);
      const ppmeter = Process_BIN_Data(this.bin.PPMeter);
      const noise = Process_BIN_Data(this.bin.NoiseLevel);
      const loudspeaker = Process_BIN_Data(this.bin.LoudspeakerActivity);

      this.bin = { VuMeter: [], PPMeter: [], NoiseLevel: [], LoudspeakerActivity: [] }
      if (callback != undefined) {
        return callback({ VuMeter: vumeter });
      }
    }
  }
}

/* 
  This function takes incoming data by type
  Processes it to return a Sum, Average, Peak and Raw Data set
  The Dataset comes in as an array
*/
function Process_BIN_Data(dataset) {
  if (dataset == undefined) {
    throw Error(JSON.stringify({ AZM_Error: `Unable to evaluate microphone VuMeter Data`, Cause: `Undefined Dataset: [${dataset}]` }))
  }
  const sum = dataset.reduce((acc, value) => parseInt(acc) + parseInt(value), 0);
  const avg = Math.round((sum / AudioConfiguration.Settings.Sample.Size))
  const peak = Math.max(...dataset);
  return { Average: avg, Peak: peak, Sample: dataset.clone() } // ToDo. State, and Zone info needs to be applied here
}

async function discoverEthernetStreamNameBySerial(serial) {
  const peripherals = await xapi.Status.Peripherals.ConnectedDevice.get()

  const streamName = peripherals.find(item => item.Name.includes('Microphone') && item.SerialNumber === serial);

  return streamName ? streamName.ID : null;
}

/* 
  This function assigns the connector id to the Audio Zone configuration for Ethernet Microphones
  Cisco Ethernet Microphones are automatically assigned a ConnectorId, and this may change
  We instead use the StreamName in the Audio Configuration, in order to discover the ConnectorId
*/
async function Append_Ethernet_ConnectorId_By_StreamName() {
  const mics = await xapi.Status.Audio.Input.Connectors.Ethernet.get();

  for (let index = 0; index < AudioConfiguration.Zones.length; index++) {
    const zone = AudioConfiguration.Zones[index];

    if (zone.MicrophoneAssignment.Type.toLowerCase() == 'ethernet' || zone.MicrophoneAssignment.Type.toLowerCase() == 'aes67') {
      for (let i = 0; i < zone.MicrophoneAssignment.Connectors.length; i++) {
        const conx = zone.MicrophoneAssignment.Connectors[i];

        if ((conx?.Serial == '' && conx?.Serial != undefined) || (conx?.StreamName == '' && conx?.StreamName == undefined)) {
          checkZoneSetup(`Zone Index [${index}] has an invalid Ethernet Microphone Configuration`);
        }

        for (const mic of mics) {
          if (mic.StreamName == conx.StreamName) {
            console.AZM.SetupDebug(`StreamName match on Zone Index [${index}], assigning Ethernet ConnectorId [${parseInt(mic.id)}] to Audio Zone Configuration`);
            AudioConfiguration.Zones[index].MicrophoneAssignment.Connectors[i].Id = parseInt(mic.id);
          } else {
            const streamName = await discoverEthernetStreamNameBySerial(conx.Serial);
            if (mic.StreamName == streamName) {
              console.AZM.SetupDebug(`StreamName match on Zone Index [${index}], assigning Ethernet ConnectorId [${parseInt(mic.id)}] to Audio Zone Configuration`);
              AudioConfiguration.Zones[index].MicrophoneAssignment.Connectors[i].Id = parseInt(mic.id);
            }
          }
        }
      }
    }
  }
}

/* 
  This function builds a report of Microphone Connector Information
*/
function discover_Audio_Connector_Info() {
  console.AZM.AdvDebug('Starting Audio Connector Info Discovery')
  let connector_Id_Arr = []
  AudioConfiguration.Zones.forEach((element) => {
    element.MicrophoneAssignment.Connectors.forEach(el => {
      connector_Id_Arr.push({ Id: el.Id, Type: element.MicrophoneAssignment.Type })
    })
  })
  connector_Id_Arr = [...new Set(connector_Id_Arr)];
  connector_Id_Arr = connector_Id_Arr.sort(function (a, b) { return a - b; });
  console.AZM.AdvDebug(`Audio Connector Discovery Id Complete. Discovered Connections > [${JSON.stringify(connector_Id_Arr)}]`)
  return connector_Id_Arr
}

/* 
  This function builds a report of Microphone Connector Types
*/
function discover_Audio_Connector_Types() {
  console.AZM.AdvDebug('Starting Audio Connector Type Discovery')
  let connector_Type_Arr = []
  AudioConfiguration.Zones.forEach((element) => {
    connector_Type_Arr.push(element.MicrophoneAssignment.Type.toLowerCase())
  })
  connector_Type_Arr = [...new Set(connector_Type_Arr)];
  connector_Type_Arr = connector_Type_Arr.sort(function (a, b) { return a - b; });
  console.AZM.AdvDebug(`Audio Connector Discovery Type Complete. Discovered Types > [${connector_Type_Arr.toString()}]`)
  return connector_Type_Arr
}


/* 
  This object tracks if the AZM.Command.Zone.Setup has been run
  This ensures those developing with AZM_Lib has passed a configuration
    into their project
*/
let ZoneSetupStatus = false;


/* 
  This function evaluates the ZoneSetupStatus
  If this Status is false, it will throw an error with context to point
    a developer in the right direction to resolve a conflict with the Audio Setup
*/
function checkZoneSetup(error) {
  if (!ZoneSetupStatus) {
    throw Error(JSON.stringify({ AZM_Error: error, Cause: 'AZM Requires an Audio Configuration to be passed into the AZM.Command.Zone.Setup() function', Tip: 'Follow the AZM Guide for proper use' }))
  }
  return
}

/* 
  This function Starts AZM
  It requires AudioZoneInfo, which needs to be defined in your Main Script or Imported
  This will instantiate all object, and prepare the environment to use AZM
*/

AZM.Command.Zone.Setup = async function (AudioZoneInfo) {
  console.AZM.info('Initializing Audio Zone Manager (AZM)')
  if (AudioZoneInfo.Settings == undefined || AudioZoneInfo.Zones == undefined) {
    checkZoneSetup('Audio Configuration Object not Provided or Formatted Properly')
  }
  //Clone the Audio Configuration Object passed to us
  AudioConfiguration = AudioZoneInfo.clone()

  //Assign ConnectorIds to any ethernet microphones within scope
  await Append_Ethernet_ConnectorId_By_StreamName()

  //Instantiate Audio Zone and Bucket Classes
  Instantiate_Audio_Zones_And_Buckets()

  //Set ZoneSetupStatus true, to allow developer access to the libraries tools
  ZoneSetupStatus = true;

  if (config_AutomaticUpdates_Mode.toLocaleLowerCase() != 'off') {
    console.AZM.log(`AZM Update Checks set to [${config_AutomaticUpdates_Mode}] and will commence every [${config_AutomaticUpdates_Schedule_Day}] at [${config_AutomaticUpdates_Schedule_Time}].`)

    const httpClient = await xapi.Config.HttpClient.get()

    if (httpClient.Mode.toLowerCase() == 'off') {
      console.AZM.warn(`Enabling HTTPClient Mode for AZM Automatic Updates in order to reach out to Github`);
      await xapi.Config.HttpClient.Mode.set('On');
    }

    Schedule(config_AutomaticUpdates_Schedule_Time, config_AutomaticUpdates_Schedule_Day, async () => {
      await automaticUpdates.StartUpdateProcess();
    })
  }
  console.AZM.info(`AZM Ready! Version: ${version}`)
}

/* 
  This function evaluates the Audio Configuration and
    instantiates all classes needed to track our audio data cleanly
  Both the Zone_Tracker and [Type]_Bucket classes are instantiates here
    into their appropriate objects for later use
  This if called when AZM.Audio.Zone.Setup(AudioConfiguration) is run
*/
function Instantiate_Audio_Zones_And_Buckets() {
  AudioConfiguration.Zones.forEach((element, index) => {
    if (AudioConfiguration.Zones[index].Label == undefined || AudioConfiguration.Zones[index].Label == '') {
      AudioConfiguration.Zones[index].Label = `ZoneIndex_${index}`
    }
    AudioConfiguration.Zones[index]['id'] = index + 1;
    console.AZM.SetupDebug(`Appending Zone Id [${index + 1}] to [${AudioConfiguration.Zones[index].Label}] || ZoneIndex: ${index}`)
    AZM.Status.Audio.Zone[element.id] = new Zone_Tracker(element.id, element.Label, element.MicrophoneAssignment.Type, element.Assets)
    switch (element.MicrophoneAssignment.Type.toLowerCase()) {
      case 'ethernet': case 'aes67':
        element.MicrophoneAssignment.Connectors.forEach(eth => {
          AudioBucket.Ethernet[eth.Id] = new Ethernet_Bucket(eth.Id, eth.SubId, element.id, element.Label, element.Assets)
          AZM.Status.Audio.Zone[element.id].addConnector(eth.Id, AudioBucket.Ethernet[eth.Id].State, element.id)
        })
        break;
      case 'microphone': case 'analog':
        element.MicrophoneAssignment.Connectors.forEach(ano => {
          AudioBucket.Analog[ano.Id] = new Analog_Bucket(ano.Id, element.id, element.Label, element.Assets)
          AZM.Status.Audio.Zone[element.id].addConnector(ano.Id, AudioBucket.Analog[ano.Id].State, element.id)
        })
        break;
      case 'usb':
        break;
      default:
        //Throw Error on unknown Microphone Assignment Type
        throw Error(JSON.stringify({ message: `Audio Connector Type [${element.MicrophoneAssignment.Type}] not accepted`, Tip: `Accepted Types: Ethernet, Analog, USB.` }))
    }
  })
}

/* 
  This function Starts the VuMeter on all Microphones defined in the AudioZone Configuration
*/

AZM.Command.Zone.Monitor.Start = async function (cause = 'N/A') {
  checkZoneSetup('Failed to Start Zone Monitor')
  const inputConnectors = discover_Audio_Connector_Info();
  for (let i = 0; i < inputConnectors.length; i++) {
    console.AZM.MonitorDebug(`Starting VuMeter on connector: Type: [${inputConnectors[i].Type}], Id: [${inputConnectors[i].Id}]`)
    let typeFix = ''
    switch (inputConnectors[i].Type.toLowerCase()) {
      case 'ethernet': case 'aes67':
        typeFix = 'Ethernet';
        break;
      case 'analog': case 'microphone':
        typeFix = 'Microphone';
        break;
      case 'usb': case 'usbmicrophone':
        typeFix = 'USBMicrophone'
        break;
    }
    await xapi.Command.Audio.VuMeter.Start({ ConnectorId: inputConnectors[i].Id, ConnectorType: typeFix, IntervalMs: AudioConfiguration.Settings.Sample.Rate_In_Ms, Source: 'AfterAEC' });
  };
  console.AZM.log('AZM Monitoring Started', { Cause: cause })
}

/* 
  This function Stops the VuMeter on all Microphones defined in your AudioZone Configuration
*/
AZM.Command.Zone.Monitor.Stop = async function (cause = 'N/A') {
  checkZoneSetup('Failed to Stop Zone Monitor')
  const inputConnectors = discover_Audio_Connector_Info()
  for (let i = 0; i < inputConnectors.length; i++) {
    console.AZM.MonitorDebug(`Stopping VuMeter on connector: Type: [${inputConnectors[i].Type}], Id: [${inputConnectors[i].Id}]`)
    let typeFix = ''
    switch (inputConnectors[i].Type.toLowerCase()) {
      case 'ethernet': case 'aes67':
        typeFix = 'Ethernet';
        break;
      case 'analog': case 'microphone':
        typeFix = 'Microphone';
        break;
      case 'usb': case 'usbmicrophone':
        typeFix = 'USBMicrophone'
        break;
    }
    await xapi.Command.Audio.VuMeter.Stop({ ConnectorId: inputConnectors[i].Id, ConnectorType: typeFix });
  };
  console.AZM.log('AZM Monitoring Stopped', { Cause: cause })
}


/* 
  Ethernet_SubId_Backfill is the Object Used by Normalize_Ethernet_Audio_Data(payload)
*/
let Ethernet_SubId_Backfill = {

}

/* 
  Normalize_Ethernet_Audio_Data will collect and store the previous value for Ethernet SubId events
  driven by xEvent Audio Input Connectors Ethernet

  Any missing information is replaced with it's last known value

  Any information not found, will be set to 0
*/

function Normalize_Ethernet_Audio_Data(payload) {
  const { SubId, id } = payload;

  // Check if id is present in backfill, if not, initialize it
  if (!Ethernet_SubId_Backfill[id]) {
    Ethernet_SubId_Backfill[id] = {};
  }

  // Iterate over SubId array and check for missing IDs
  for (let i = 1; i <= 8; i++) {
    const subId = i.toString();

    // Check if the subId is present in the SubId array
    const idExists = SubId.some(item => item.id === subId);

    // If the subId is missing, backfill from the previous sample if available
    if (!idExists) {
      const previousSample = Ethernet_SubId_Backfill[id][subId];

      // If previous sample is available, backfill the data
      if (previousSample) {
        SubId.push({ ...previousSample, id: subId });
      } else {
        // If no previous sample, you might want to set default values or handle it as needed
        SubId.push({
          LoudspeakerActivity: '0',
          NoiseLevel: '0',
          PPMeter: '0',
          VuMeter: '0',
          id: subId,
        });
      }
    }
  }

  // Sort SubId array numerically based on the 'id' property
  SubId.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

  // Update backfill with the latest data from SubId array
  Ethernet_SubId_Backfill[id] = SubId.reduce((acc, item) => {
    acc[item.id] = { ...item };
    delete acc[item.id].id; // Remove the 'id' property in the backfill
    return acc;
  }, {});

  // Return the updated payload
  return {
    SubId,
    id,
  };
}

/* 
  This function serves as a replacement Subscription for xEvent Audio [Type] Connectors path
  This will determine which audio events are required in your config and will subscribe on your behalf
  This will also evaluate all audio information coming in and
    Update Audio Buckets and Zone Classes
    Callback a High Middle or Low state based on your Audio Configuration
  
  The purpose of this object is to only provide a Callback when a relevant change has occurred in your environment, not all audio data
*/
AZM.Event.TrackZones.on = function (callBack) {
  checkZoneSetup('Unable to subscribe to AZM.Event.TrackZones')
  const types = discover_Audio_Connector_Types()

  types.forEach(element => {
    switch (element.toLowerCase()) {
      case 'ethernet': case 'aes67':
        xapi.Event.Audio.Input.Connectors.Ethernet.on(ethernet_input_event => {
          if (config_settings_NormalizeEthernetSubIdPayload) {
            AudioBucket.Ethernet[ethernet_input_event.id].run(Normalize_Ethernet_Audio_Data(ethernet_input_event), callBack)
          } else {
            AudioBucket.Ethernet[ethernet_input_event.id].run(ethernet_input_event, callBack)
          }
        })
        console.AZM.info(`Subscription enabled instantiated for xapi.Event.Audio.Input.Connectors.Ethernet`)
        break;
      case 'microphone': case 'analog':
        xapi.Event.Audio.Input.Connectors.Microphone.on(analog_input_event => {
          AudioBucket.Analog[analog_input_event.id].run(analog_input_event, callBack)
        })
        console.AZM.info(`Subscription enabled instantiated for xapi.Event.Audio.Input.Connectors.Microphone`)
        break
      case 'usb':
        xapi.Event.Audio.Input.Connectors.USB.on(usb_input_event => {
          //Run Audio Logic Against Connector ID
          //Callback Processed information
        })
        console.AZM.info(`Subscription enabled instantiated for xapi.Event.Audio.Input.Connectors.USBMicrophone`)
        break;
      default:
        throw Error(JSON.stringify({
          AZM_Error: `Unknown Microphone Input Type: [${element}]`,
          AllowedTypes: 'Ethernet, Analog, USB'
        }))
    }
  })
}

export { AZM };