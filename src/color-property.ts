/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

import {Device, Property} from 'gateway-addon';
import fetch from 'node-fetch';
import {WledDescription} from './wled';

export class ColorProperty extends Property<string> {
  // eslint-disable-next-line no-unused-vars
  constructor(device: Device, private url: string) {
    super(device, 'color', {
      '@type': 'ColorProperty',
      type: 'string',
      title: 'Color',
    });
  }

  async setValue(value: string): Promise<string> {
    const components = [
      parseInt(value.slice(1, 3), 16),
      parseInt(value.slice(3, 5), 16),
      parseInt(value.slice(5), 16),
    ];

    const body = {
      seg: {col: [components, [], []]},
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

  update(wledDescription: WledDescription): void {
    const values = wledDescription.state.seg[0].col[0];
    const color = Buffer.from(values)
      .toString('hex');
    this.setCachedValueAndNotify(`#${color}`);
  }
}
