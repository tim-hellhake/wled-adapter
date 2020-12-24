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
import {MdnsService} from './mdns';

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
    this.wledBrowser = new Browser(tcp('wled'));

    this.wledBrowser.on('serviceUp', async (service) => {
      this.handleService(service);
    });

    this.wledBrowser.start();
  }

  private removeTrailingDot(str: string) {
    if (str.length > 0 && str.lastIndexOf('.') === (str.length - 1)) {
      return str.substring(0, str.length - 1);
    }

    return str;
  }

  private async handleService(service: MdnsService) {
    const {
      pollInterval,
      useIpInsteadOfHostname,
    } = this.config;

    const name = service.name;
    let host = this.removeTrailingDot(service.host);

    if (useIpInsteadOfHostname) {
      host = service.addresses[0];
    }

    const port = service.port;
    console.log(`Discovered wled service ${name} at ${host}:${port}`);

    const url = `http://${host}:${port}/json/si`;

    const response = await fetch(url);
    const json: WledDescription = await response.json();

    const wledDevice = new WledDevice(this, name, url, json);
    this.handleDeviceAdded(wledDevice);
    wledDevice.startPolling((pollInterval || 1000));
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
