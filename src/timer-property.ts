/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import fetch from 'node-fetch';
import {WledDescription} from './wled';

export class TimerProperty extends Property<boolean> {

  // eslint-disable-next-line no-unused-vars
  constructor(device: Device, private url: string) {
    super(device, 'timer', {
      type: 'boolean',
      title: 'Timer',
    });
  }

  async setValue(value: boolean): Promise<boolean> {
    const body = {
      nl: {
        on: value,
      },
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
    const timer = wledDescription.state.nl.on;
    this.setCachedValueAndNotify(timer);
  }
}
