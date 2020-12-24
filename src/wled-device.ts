/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Adapter, Device} from 'gateway-addon';
import fetch from 'node-fetch';
import {BrightnessProperty} from './brightness-property';
import {ColorProperty} from './color-property';
import {OnOffProperty} from './on-off-property';
import {WledDescription} from './wled';

export class WledDevice extends Device {
  private onOffProperty: OnOffProperty;

  private brightnessProperty: BrightnessProperty;

  private colorProperty: ColorProperty;

  constructor(
    adapter: Adapter,
    id: string,
    private url: string,
    wledDescription: WledDescription) {
    super(adapter, id);
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = ['Light'];
    this.setTitle(wledDescription.info.name);

    this.onOffProperty = new OnOffProperty(this, url);
    this.addProperty(this.onOffProperty);
    this.brightnessProperty = new BrightnessProperty(this, url);
    this.addProperty(this.brightnessProperty);
    this.colorProperty = new ColorProperty(this, url);
    this.addProperty(this.colorProperty);
  }

  public startPolling(intervalMs: number): void {
    setInterval(() => this.poll(), intervalMs);
  }

  async poll(): Promise<void> {
    const response = await fetch(this.url);
    const json: WledDescription = await response.json();
    this.onOffProperty.update(json);
    this.brightnessProperty.update(json);
    this.colorProperty.update(json);
  }
}
