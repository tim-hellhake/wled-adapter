/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter, AddonManagerProxy} from 'gateway-addon';
import {Browser, tcp} from 'dnssd';
import {WledDescription} from './wled';
import {WledDevice} from './wled-device';
import {Config} from './config';
import fetch from 'node-fetch';

export interface Manifest {
  name: string,
  display_name: string,
  moziot: {
      config: Record<string, string>
  }
}

export class WledAdapter extends Adapter {
  private wledBrowser?: Browser;

  constructor(
    // eslint-disable-next-line no-unused-vars
    addonManager: AddonManagerProxy, id: string, private config: Config) {
    super(addonManager, id, id);
    addonManager.addAdapter(this);
    this.startDiscovery();
  }

  public startPairing(): void {
    console.log('Start pairing');
    this.stopDiscovery();
    this.startDiscovery();
  }

  public startDiscovery(): void {
    const {
      useIpInsteadOfHostname,
      devices,
    } = this.config;

    if (devices) {
      for (const device of devices) {
        const {
          host,
          port,
        } = device;

        const devicePort = port || 80;
        console.log(`Adding manual wled device at ${host}:${devicePort}`);
        this.handleService(host, host, devicePort);
      }
    }

    this.wledBrowser = new Browser(tcp('wled'));

    this.wledBrowser.on('serviceUp', async (service) => {
      const {
        name,
        host,
        port,
        addresses,
      } = service;

      let hostname = this.removeTrailingDot(host);

      if (useIpInsteadOfHostname) {
        hostname = addresses[0];
      }

      console.log(`Discovered wled service ${name} at ${host}:${port}`);
      this.handleService(name, hostname, port);
    });

    this.wledBrowser.start();
  }

  private removeTrailingDot(str: string) {
    if (str.length > 0 && str.lastIndexOf('.') === (str.length - 1)) {
      return str.substring(0, str.length - 1);
    }

    return str;
  }

  private async handleService(name: string, host: string, port: number) {
    const {
      pollInterval,
    } = this.config;

    const url = `http://${host}:${port}/json/si`;

    this.getWledDescription(url, (json: WledDescription) => {
      const wledDevice = new WledDevice(this, name, url, json);
      this.handleDeviceAdded(wledDevice);
      console.log('Added WLED device', name);
      wledDevice.startPolling((pollInterval || 1000));
    });
  }

  private async getWledDescription(
    url: string,
    cb: (_json: WledDescription) => void,
    firstTry = true
  ) {
    try {
      const response = await fetch(url);
      const json: WledDescription = await response.json();

      cb(json);
    } catch (ex) {
      if (firstTry) {
        console.error('Communication error: ', ex, '\nI will keep retrying!');
      }

      const {
        pollInterval,
      } = this.config;

      setTimeout(
        this.getWledDescription.bind(this, url, cb, false),
        (pollInterval || 10000)
      );
    }
  }

  public cancelPairing(): void {
    console.log('Cancel pairing');
    this.stopDiscovery();
  }

  private stopDiscovery() {
    if (this.wledBrowser) {
      this.wledBrowser.stop();
      // eslint-disable-next-line no-undefined
      this.wledBrowser = undefined;
    }
  }
}
