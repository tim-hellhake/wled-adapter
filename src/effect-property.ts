/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import fetch from 'node-fetch';
import {WledDescription} from './wled';

export class EffectProperty extends Property<string> {

  // eslint-disable-next-line no-unused-vars
  constructor(device: Device, private url: string, private effects: [string]) {
    super(device, 'effect', {
      type: 'string',
      title: 'Effect',
      enum: effects,
    });
  }

  async setValue(value: string): Promise<string> {
    const body = {
      seg: {fx: this.effects.indexOf(value)},
      v: true,
    };

    const response = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (response.status != 200) {
      // eslint-disable-next-line max-len
      console.log(`Could not set value: ${response.status} (${response.statusText})`);
    }

    return super.setValue(value);
  }

  async update(wledDescription: WledDescription): Promise<void> {
    const effect = wledDescription.state.seg[0].fx;
    this.setCachedValueAndNotify(this.effects[effect]);
  }
}
